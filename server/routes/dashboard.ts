import { Router, type IRouter } from "express";
import { Transaction, Customer, Product, Category, Brand, Supplier } from "../db";
import { GetDashboardStatsResponse } from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [todayTxns, allCustomers, allProducts, yearTxns, recentTxns, allCategories, allBrands, allSuppliers] = await Promise.all([
    Transaction.find({ createdAt: { $gte: todayStart, $lt: tomorrowStart }, status: "completed" }),
    Customer.find(),
    Product.find({ isActive: true }).lean(),
    Transaction.find({ createdAt: { $gte: yearStart }, status: "completed" }),
    Transaction.find({ status: "completed" }).sort({ createdAt: -1 }).limit(10),
    Category.find({ isActive: true }).lean(),
    Brand.find({ isActive: true }).lean(),
    Supplier.find().lean(),
  ]);

  const catMap: Record<string, string> = {};
  const brandMap: Record<string, string> = {};
  allCategories.forEach((c: any) => { catMap[c._id.toString()] = c.name; });
  allBrands.forEach((b: any) => { brandMap[b._id.toString()] = b.name; });

  const todaySales = todayTxns.reduce((s, t) => s + t.total, 0);
  const todayOrders = todayTxns.length;

  const dueCustomers = allCustomers.filter(c => c.balance > 0);
  const totalDueAmount = dueCustomers.reduce((s, c) => s + c.balance, 0);

  // Use stockQuantity for MERN products, fall back to stock for legacy
  const lowStockItems = allProducts.filter(p => {
    const qty = p.stockQuantity ?? (p as any).stock ?? 0;
    const min = (p as any).minStock ?? 5;
    return qty <= min;
  }).slice(0, 10);
  const lowStockCount = allProducts.filter(p => {
    const qty = p.stockQuantity ?? (p as any).stock ?? 0;
    const min = (p as any).minStock ?? 5;
    return qty <= min;
  }).length;

  const monthlySalesMap = new Array(12).fill(0);
  for (const t of yearTxns) {
    monthlySalesMap[t.createdAt.getMonth()] += t.total;
  }
  const monthlySales = MONTH_NAMES.map((month, i) => ({ month, sales: Math.round(monthlySalesMap[i] * 100) / 100 }));

  // Top categories by revenue from transactions
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  for (const t of yearTxns) {
    for (const item of t.items) {
      const prod = allProducts.find(p => p._id.toString() === String(item.productId));
      const catId = prod?.categoryId?.toString();
      const cat = catId ? (catMap[catId] ?? "Other") : "Other";
      categoryTotals[cat] = (categoryTotals[cat] ?? 0) + item.lineTotal;
      grandTotal += item.lineTotal;
    }
  }

  const catColors: Record<string, string> = {
    "Dry Food": "#F97316", "Wet Food": "#2563EB", "Treats": "#16A34A",
    "Supplements": "#D97706", "Accessories": "#DC2626",
    "Adult Food": "#F97316", "Kitten Food": "#2563EB", "Collar": "#16A34A",
    "Other": "#78716C",
  };

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({
      name,
      value: grandTotal > 0 ? Math.round((value / grandTotal) * 100) : 0,
      fill: catColors[name] ?? "#78716C",
    }));

  const toProductDto = (p: any) => ({
    id: p._id.toString(),
    sku: p.sku ?? p._id.toString(),
    name: p.name,
    brand: p.brandId ? (brandMap[p.brandId.toString()] ?? "") : (p.brand ?? ""),
    category: p.categoryId ? (catMap[p.categoryId.toString()] ?? "") : (p.category ?? ""),
    price: p.price,
    cost: p.cost ?? 0,
    stock: p.stockQuantity ?? p.stock ?? 0,
    minStock: p.minStock ?? 5,
    unit: p.unit ?? "pcs",
    weight: p.weight ?? null,
    active: p.isActive ?? true,
    createdAt: (p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)).toISOString(),
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

  // ── Top Products by revenue ───────────────────────────────────
  const productRevMap: Record<string, { name: string; category: string; revenue: number; units: number }> = {};
  for (const t of yearTxns) {
    for (const item of t.items) {
      const key = String(item.productId ?? item.productName);
      const prod = allProducts.find(p => p._id.toString() === String(item.productId));
      const catId = prod?.categoryId?.toString();
      const cat = catId ? (catMap[catId] ?? "Other") : "Other";
      if (!productRevMap[key]) productRevMap[key] = { name: item.productName, category: cat, revenue: 0, units: 0 };
      productRevMap[key].revenue += item.lineTotal;
      productRevMap[key].units += item.qty;
    }
  }
  const topProducts = Object.entries(productRevMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5)
    .map(([id, v], i) => ({ id, name: v.name, category: v.category, revenue: Math.round(v.revenue * 100) / 100, units: v.units, rank: i + 1 }));

  // ── Top Customers by spend ────────────────────────────────────
  const topCustomers = [...allCustomers]
    .sort((a, b) => b.totalPurchases - a.totalPurchases)
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, phone: c.phone ?? null, totalPurchases: c.totalPurchases, visits: c.visits, group: c.group }));

  // ── Income by payment method ──────────────────────────────────
  const methodMap: Record<string, { amount: number; count: number }> = {};
  for (const t of yearTxns) {
    const m = t.paymentMethod ?? "Cash";
    if (!methodMap[m]) methodMap[m] = { amount: 0, count: 0 };
    methodMap[m].amount += t.total;
    methodMap[m].count += 1;
  }
  const totalIncome = Object.values(methodMap).reduce((s, v) => s + v.amount, 0);
  const incomeByAccount = Object.entries(methodMap)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([method, v]) => ({
      method,
      amount: Math.round(v.amount * 100) / 100,
      count: v.count,
      pct: totalIncome > 0 ? Math.round((v.amount / totalIncome) * 100) : 0,
    }));

  // ── Customer Due List ─────────────────────────────────────────
  const customerDueList = dueCustomers
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)
    .map(c => ({ id: c.id, name: c.name, phone: c.phone ?? null, balance: c.balance, group: c.group }));

  // ── Supplier Due ──────────────────────────────────────────────
  const dueSuppliers = allSuppliers.filter((s: any) => s.balance > 0);
  const supplierDueAmount = dueSuppliers.reduce((sum: number, s: any) => sum + s.balance, 0);
  const supplierDueList = dueSuppliers
    .sort((a: any, b: any) => b.balance - a.balance)
    .slice(0, 5)
    .map((s: any) => ({ id: s.id, name: s.name, phone: s.phone ?? null, balance: s.balance }));

  const stats = {
    todaySales,
    todayOrders,
    totalCustomersDue: dueCustomers.length,
    totalDueAmount,
    lowStockCount,
    monthlySales,
    topCategories: topCategories.length > 0 ? topCategories : [
      { name: "Adult Food", value: 38, fill: "#F97316" },
      { name: "Kitten Food", value: 27, fill: "#2563EB" },
      { name: "Collar", value: 18, fill: "#16A34A" },
      { name: "Supplements", value: 11, fill: "#D97706" },
      { name: "Accessories", value: 6, fill: "#DC2626" },
    ],
    lowStockItems: lowStockItems.map(toProductDto),
    recentTransactions: recentTxns.map(toTxn),
    topProducts,
    topCustomers,
    incomeByAccount,
    customerDueList,
    supplierDueAmount,
    supplierDueList,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
