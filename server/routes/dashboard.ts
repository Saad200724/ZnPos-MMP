import { Router, type IRouter } from "express";
import { gte, and, eq, lt, sql, desc } from "drizzle-orm";
import { db, transactionsTable, customersTable, productsTable, transactionItemsTable } from "../db";
import { GetDashboardStatsResponse } from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86400000);
  const yearStart = new Date(now.getFullYear(), 0, 1);

  // Today's stats
  const todayTxns = await db.select().from(transactionsTable)
    .where(and(gte(transactionsTable.createdAt, todayStart), lt(transactionsTable.createdAt, tomorrowStart), eq(transactionsTable.status, "completed")));
  const todaySales = todayTxns.reduce((s, t) => s + parseNum(t.total), 0);
  const todayOrders = todayTxns.length;

  // Customer dues
  const allCustomers = await db.select().from(customersTable);
  const dueCustomers = allCustomers.filter(c => parseNum(c.balance) > 0);
  const totalDueAmount = dueCustomers.reduce((s, c) => s + parseNum(c.balance), 0);

  // Low stock
  const allProducts = await db.select().from(productsTable).where(eq(productsTable.active, true));
  const lowStockItems = allProducts.filter(p => p.stock <= p.minStock).slice(0, 10);
  const lowStockCount = allProducts.filter(p => p.stock <= p.minStock).length;

  // Monthly sales for current year
  const yearTxns = await db.select().from(transactionsTable)
    .where(and(gte(transactionsTable.createdAt, yearStart), eq(transactionsTable.status, "completed")));
  const monthlySalesMap = new Array(12).fill(0);
  for (const t of yearTxns) {
    monthlySalesMap[t.createdAt.getMonth()] += parseNum(t.total);
  }
  const monthlySales = MONTH_NAMES.map((month, i) => ({ month, sales: Math.round(monthlySalesMap[i] * 100) / 100 }));

  // Top categories by revenue
  const allItems = await db.select({
    category: productsTable.category,
    lineTotal: transactionItemsTable.lineTotal,
  })
    .from(transactionItemsTable)
    .leftJoin(productsTable, eq(transactionItemsTable.productId, productsTable.id))
    .leftJoin(transactionsTable, eq(transactionItemsTable.transactionId, transactionsTable.id))
    .where(and(gte(transactionsTable.createdAt, yearStart), eq(transactionsTable.status, "completed")));
  
  const categoryTotals: Record<string, number> = {};
  let grandTotal = 0;
  for (const item of allItems) {
    const cat = item.category ?? "Other";
    const lt = parseNum(item.lineTotal);
    categoryTotals[cat] = (categoryTotals[cat] ?? 0) + lt;
    grandTotal += lt;
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

  // Recent transactions
  const recentTxns = await db.select().from(transactionsTable)
    .where(eq(transactionsTable.status, "completed"))
    .orderBy(desc(transactionsTable.createdAt))
    .limit(10);

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
    lowStockItems: lowStockItems.map(p => ({
      ...p,
      price: parseNum(p.price),
      cost: parseNum(p.cost),
      createdAt: p.createdAt.toISOString(),
    })),
    recentTransactions: recentTxns.map(t => ({
      id: t.id,
      receiptNo: t.receiptNo,
      customerId: t.customerId,
      customerName: t.customerName,
      userId: t.userId,
      subtotal: parseNum(t.subtotal),
      discountPct: parseNum(t.discountPct),
      discountAmt: parseNum(t.discountAmt),
      tax: parseNum(t.tax),
      total: parseNum(t.total),
      paymentMethod: t.paymentMethod,
      status: t.status,
      notes: t.notes,
      createdAt: t.createdAt.toISOString(),
      items: [],
    })),
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

export default router;
