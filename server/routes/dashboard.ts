import { Router, type IRouter } from "express";
import { Transaction, Customer, Product } from "../db";
import { GetDashboardStatsResponse } from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [todayTxns, allCustomers, allProducts, yearTxns, recentTxns] = await Promise.all([
    Transaction.find({ createdAt: { $gte: todayStart, $lt: tomorrowStart }, status: "completed" }),
    Customer.find(),
    Product.find({ active: true }),
    Transaction.find({ createdAt: { $gte: yearStart }, status: "completed" }),
    Transaction.find({ status: "completed" }).sort({ createdAt: -1 }).limit(10),
  ]);

  const todaySales = todayTxns.reduce((s, t) => s + t.total, 0);
  const todayOrders = todayTxns.length;

  const dueCustomers = allCustomers.filter(c => c.balance > 0);
  const totalDueAmount = dueCustomers.reduce((s, c) => s + c.balance, 0);

  const lowStockItems = allProducts.filter(p => p.stock <= p.minStock).slice(0, 10);
  const lowStockCount = allProducts.filter(p => p.stock <= p.minStock).length;

  const monthlySalesMap = new Array(12).fill(0);
  for (const t of yearTxns) {
    monthlySalesMap[t.createdAt.getMonth()] += t.total;
  }
  const monthlySales = MONTH_NAMES.map((month, i) => ({ month, sales: Math.round(monthlySalesMap[i] * 100) / 100 }));

  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;

  for (const t of yearTxns) {
    for (const item of t.items) {
      const prod = allProducts.find(p => p.id === item.productId);
      const cat = prod?.category ?? "Other";
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + item.lineTotal;
      grandTotal += item.lineTotal;
    }
  }

  const catColors: Record<string, string> = {
    "Dry Food": "#F97316", "Wet Food": "#2563EB", "Treats": "#16A34A",
    "Supplements": "#D97706", "Accessories": "#DC2626", "Other": "#78716C",
  };

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
      fill: catColors[name] ?? "#78716C",
    }));

  const toProduct = (p: any) => ({
    id: p.id, sku: p.sku, name: p.name, brand: p.brand, category: p.category,
    price: p.price, cost: p.cost, stock: p.stock, minStock: p.minStock,
    unit: p.unit, weight: p.weight ?? null, active: p.active,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
  });

  const toTxn = (t: any) => ({
    id: t.id, receiptNo: t.receiptNo, customerId: t.customerId ?? null,
    customerName: t.customerName, userId: t.userId ?? null,
    subtotal: t.subtotal, discountPct: t.discountPct, discountAmt: t.discountAmt,
    tax: t.tax, total: t.total, paymentMethod: t.paymentMethod,
    status: t.status, notes: t.notes ?? null,
    createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
    items: [],
  });

  const stats = {
    todaySales,
    todayOrders,
    totalCustomersDue: dueCustomers.length,
    totalDueAmount,
    lowStockCount,
    monthlySales,
    topCategories: topCategories.length > 0 ? topCategories : [
      { name: "Dry Food", value: 38, fill: "#F97316" },
      { name: "Wet Food", value: 27, fill: "#2563EB" },
      { name: "Treats", value: 18, fill: "#16A34A" },
      { name: "Supplements", value: 11, fill: "#D97706" },
      { name: "Accessories", value: 6, fill: "#DC2626" },
    ],
    lowStockItems: lowStockItems.map(toProduct),
    recentTransactions: recentTxns.map(toTxn),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
