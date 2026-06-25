import { Router, type IRouter } from "express";
import { Transaction, Product, Customer, nextId } from "../db";
import {
  GetTransactionsResponse, GetTransactionResponse, CreateTransactionBody,
  GetTransactionParams,
} from "../../shared/src";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

const toTransaction = (t: any) => ({
  id: t.id,
  receiptNo: t.receiptNo,
  customerId: t.customerId ?? null,
  customerName: t.customerName,
  userId: t.userId ?? null,
  subtotal: t.subtotal,
  discountPct: t.discountPct,
  discountAmt: t.discountAmt,
  tax: t.tax,
  total: t.total,
  paymentMethod: t.paymentMethod,
  status: t.status,
  notes: t.notes ?? null,
  createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
  items: (t.items ?? []).map((i: any) => ({
    id: i.id,
    transactionId: t.id,
    productId: i.productId ?? null,
    productName: i.productName,
    productBrand: i.productBrand,
    sku: i.sku,
    price: i.price,
    qty: i.qty,
    lineTotal: i.lineTotal,
  })),
});

function generateReceiptNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `POS-${date}-${ts}-${rand}`;
}

router.get("/transactions", requireAuth, async (req, res): Promise<void> => {
  const transactions = await Transaction.find().sort({ createdAt: -1 }).limit(100);
  res.json(GetTransactionsResponse.parse(transactions.map(toTransaction)));
});

router.post("/transactions", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateTransactionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const txId = await nextId("transactions");
  const receiptNo = generateReceiptNo();

  let itemIdStart = txId * 1000;
  const items = data.items.map((item, idx) => ({
    id: itemIdStart + idx,
    productId: item.productId ?? null,
    productName: item.productName,
    productBrand: item.productBrand,
    sku: item.sku,
    price: item.price,
    qty: item.qty,
    lineTotal: item.lineTotal,
  }));

  const transaction = await Transaction.create({
    id: txId,
    receiptNo,
    customerId: data.customerId ?? null,
    customerName: data.customerName ?? "Walk-in Customer",
    userId: req.session.userId ?? null,
    subtotal: data.subtotal,
    discountPct: data.discountPct ?? 0,
    discountAmt: data.discountAmt ?? 0,
    tax: data.tax ?? 0,
    total: data.total,
    paymentMethod: data.paymentMethod,
    status: "completed",
    notes: data.notes ?? null,
    items,
  });

  for (const item of data.items) {
    if (item.productId) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: -item.qty }, $set: { updatedAt: new Date() } }
      );
      await Product.findOneAndUpdate(
        { id: item.productId, stock: { $lt: 0 } },
        { $set: { stock: 0 } }
      );
    }
  }

  if (data.customerId) {
    const customer = await Customer.findOne({ id: data.customerId });
    if (customer) {
      const newTotalPurchases = customer.totalPurchases + data.total;
      const newBalance = data.paymentMethod === "credit"
        ? customer.balance + data.total
        : customer.balance;
      await Customer.findOneAndUpdate(
        { id: data.customerId },
        {
          $set: {
            visits: customer.visits + 1,
            totalPurchases: newTotalPurchases,
            balance: newBalance,
            updatedAt: new Date(),
          },
        }
      );
    }
  }

  res.status(201).json(GetTransactionResponse.parse(toTransaction(transaction)));
});

router.get("/transactions/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetTransactionParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const transaction = await Transaction.findOne({ id: params.data.id });
  if (!transaction) { res.status(404).json({ error: "Transaction not found" }); return; }
  res.json(GetTransactionResponse.parse(toTransaction(transaction)));
});

export default router;
