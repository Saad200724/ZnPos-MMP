import { pgTable, serial, integer, text, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const transactionItemsTable = pgTable("transaction_items", {
  id: serial("id").primaryKey(),
  transactionId: integer("transaction_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  productBrand: text("product_brand").notNull().default(""),
  sku: text("sku").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  qty: integer("qty").notNull(),
  lineTotal: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

export const insertTransactionItemSchema = createInsertSchema(transactionItemsTable).omit({ id: true });
export type InsertTransactionItem = z.infer<typeof insertTransactionItemSchema>;
export type TransactionItem = typeof transactionItemsTable.$inferSelect;
