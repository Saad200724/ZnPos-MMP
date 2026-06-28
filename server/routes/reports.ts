import { Router, type IRouter } from "express";
import { Transaction, Expense, Purchase, Product, Customer } from "../db";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/reports/summary", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [txAll, txMonth, expMonth, purchases, products, customers, expAll] = await Promise.all([
    Transaction.find({ status: "completed" }),
    Transaction.find({ status: "completed", createdAt: { $gte: startOfMonth } }),
    Expense.find({ date: { $gte: startOfMonth } }),
    Purchase.find({ createdAt: { $gte: startOfMonth } }),
    Product.find(),
    Customer.find({ status: "Active" }),
    Expense.find({ date: { $gte: startOfYear } }),
  ]);

  const totalRevenue = txAll.reduce((s, t) => s + t.total, 0);
  const monthRevenue = txMonth.reduce((s, t) => s + t.total, 0);
  const monthExpenses = expMonth.reduce((s, e) => s + e.amount, 0);
  const yearExpenses = expAll.reduce((s, e) => s + e.amount, 0);
  const monthPurchases = purchases.reduce((s, p) => s + (p.total ?? 0), 0);
  const lowStock = products.filter((p: any) => p.stockQuantity <= (p.minStockLevel ?? 5)).length;
  const outOfStock = products.filter((p: any) => p.stockQuantity === 0).length;

  const productMap: Record<string, { name: string; brand: string; qty: number; revenue: number }> = {};
  for (const tx of txAll) {
    for (const item of (tx as any).items ?? []) {
      const key = item.productName;
      if (!productMap[key]) productMap[key] = { name: item.productName, brand: item.productBrand ?? "", qty: 0, revenue: 0 };
      productMap[key].qty += item.qty;
      productMap[key].revenue += item.lineTotal;
    }
  }
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  const last7: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const dayTx = txAll.filter((t: any) => t.createdAt.toISOString().slice(0, 10) === dayStr);
    last7.push({ date: dayStr, revenue: dayTx.reduce((s, t) => s + t.total, 0), orders: dayTx.length });
  }

  const paymentBreakdown: Record<string, number> = {};
  for (const tx of txAll) {
    paymentBreakdown[tx.paymentMethod] = (paymentBreakdown[tx.paymentMethod] ?? 0) + tx.total;
  }

  res.json({
    totalRevenue, monthRevenue, monthExpenses, yearExpenses, monthPurchases,
    totalOrders: txAll.length, monthOrders: txMonth.length,
    avgOrderValue: txAll.length ? totalRevenue / txAll.length : 0,
    totalProducts: products.length, lowStock, outOfStock,
    totalCustomers: customers.length,
    topProducts, last7days: last7, paymentBreakdown,
    netProfitMonth: monthRevenue - monthExpenses - monthPurchases,
  });
});

export default router;
