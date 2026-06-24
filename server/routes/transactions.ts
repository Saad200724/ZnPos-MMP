import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, transactionsTable, transactionItemsTable, productsTable, customersTable } from "../db";
import {
  GetTransactionsResponse, GetTransactionResponse, CreateTransactionBody,
  GetTransactionParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";
import { parseNum } from "../lib/coerce";

const router: IRouter = Router();

const toTransaction = (t: typeof transactionsTable.$inferSelect, items: typeof transactionItemsTable.$inferSelect[] = []) => ({
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
  items: items.map(i => ({
    id: i.id,
    transactionId: i.transactionId,
    productId: i.productId,
    productName: i.productName,
    productBrand: i.productBrand,
    sku: i.sku,
    price: parseNum(i.price),
    qty: i.qty,
    lineTotal: parseNum(i.lineTotal),
  })),
});

function generateReceiptNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `POS-${date}-${ts}-${rand}`;
}

router.get("/transactions", requireAuth, async (req, res): Promise<void> => {
  const transactions = await db.select().from(transactionsTable).orderBy(desc(transactionsTable.createdAt)).limit(100);
  res.json(GetTransactionsResponse.parse(transactions.map(t => toTransaction(t))));
});

router.post("/transactions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  
  const receiptNo = generateReceiptNo();
  
  const [transaction] = await db.insert(transactionsTable).values({
    receiptNo,
    customerId: data.customerId ?? null,
    customerName: data.customerName ?? "Walk-in Customer",
    userId: req.session.userId ?? null,
    subtotal: String(data.subtotal),
    discountPct: String(data.discountPct ?? 0),
    discountAmt: String(data.discountAmt ?? 0),
    tax: String(data.tax ?? 0),
    total: String(data.total),
    paymentMethod: data.paymentMethod,
    status: "completed",
    notes: data.notes ?? null,
  }).returning();

  const items = await db.insert(transactionItemsTable).values(
    data.items.map(item => ({
      transactionId: transaction.id,
      productId: item.productId ?? null,
      productName: item.productName,
      productBrand: item.productBrand,
      sku: item.sku,
      price: String(item.price),
      qty: item.qty,
      lineTotal: String(item.lineTotal),
    }))
  ).returning();

  for (const item of data.items) {
    if (item.productId) {
      await db.update(productsTable)
        .set({ stock: sql`GREATEST(0, ${productsTable.stock} - ${item.qty})` })
        .where(eq(productsTable.id, item.productId));
    }
  }

  if (data.customerId) {
    const [customer] = await db.select().from(customersTable).where(eq(customersTable.id, data.customerId));
    if (customer) {
      const newTotalPurchases = parseNum(customer.totalPurchases) + data.total;
      const newBalance = data.paymentMethod === "credit" 
        ? parseNum(customer.balance) + data.total 
        : parseNum(customer.balance);
      await db.update(customersTable).set({
        visits: customer.visits + 1,
        totalPurchases: String(newTotalPurchases),
        balance: String(newBalance),
      }).where(eq(customersTable.id, data.customerId));
    }
  }

  res.status(201).json(GetTransactionResponse.parse(toTransaction(transaction, items)));
});

router.get("/transactions/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const [transaction] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, params.data.id));
  if (!transaction) { res.status(404).json({ error: "Transaction not found" }); return; }
  const items = await db.select().from(transactionItemsTable).where(eq(transactionItemsTable.transactionId, transaction.id));
  res.json(GetTransactionResponse.parse(toTransaction(transaction, items)));
});

export default router;
