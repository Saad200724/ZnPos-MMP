import bcrypt from "bcryptjs";
import { db, usersTable, productsTable, customersTable, suppliersTable, transactionsTable, transactionItemsTable } from "../db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // 1. Admin User
  const adminExists = await db.select().from(usersTable).where(eq(usersTable.username, "admin"));
  if (adminExists.length === 0) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await db.insert(usersTable).values({
      username: "admin",
      passwordHash,
      name: "Admin User",
      role: "admin",
      branch: "Main Branch",
    });
    console.log("Admin user created.");
  }

  // 2. Products
  const products = [
    { sku: "RC-INA-2K", name: "Royal Canin Indoor Adult", category: "Dry Food", brand: "Royal Canin", price: "38.99", cost: "22.00", stock: 24, minStock: 10, weight: "2kg" },
    { sku: "HS-SDA", name: "Hill's Science Diet Adult", category: "Dry Food", brand: "Hill's", price: "42.50", cost: "25.00", stock: 12, minStock: 8, weight: "1.5kg" },
    { sku: "WK-TNA", name: "Whiskas Tuna Pouch", category: "Wet Food", brand: "Whiskas", price: "1.99", cost: "0.80", stock: 96, minStock: 30, weight: "85g" },
    { sku: "PP-KIT", name: "Purina Pro Plan Kitten", category: "Dry Food", brand: "Purina", price: "29.99", cost: "18.00", stock: 3, minStock: 6, weight: "1kg" },
    { sku: "BB-WLD", name: "Blue Buffalo Wilderness", category: "Dry Food", brand: "Blue Buffalo", price: "54.99", cost: "32.00", stock: 15, minStock: 8, weight: "2.5kg" },
    { sku: "FF-GRV", name: "Fancy Feast Gravy", category: "Wet Food", brand: "Fancy Feast", price: "2.49", cost: "1.00", stock: 72, minStock: 40, weight: "85g" },
    { sku: "TMP-CLS", name: "Temptations Classic", category: "Treats", brand: "TEMPTATIONS", price: "8.99", cost: "4.50", stock: 30, minStock: 15, weight: "180g" },
    { sku: "GRN-DEN", name: "Greenies Dental Treats", category: "Treats", brand: "Greenies", price: "14.99", cost: "7.50", stock: 2, minStock: 10, weight: "120g" },
    { sku: "NV-VIT", name: "NaturVet Vitamins", category: "Supplements", brand: "NaturVet", price: "22.99", cost: "12.00", stock: 20, minStock: 5, weight: "120 tabs" },
    { sku: "OR-C-K", name: "Orijen Cat & Kitten", category: "Dry Food", brand: "Orijen", price: "68.99", cost: "42.00", stock: 6, minStock: 5, weight: "1.8kg" },
    { sku: "IM-PRO", name: "Iams Proactive Health", category: "Dry Food", brand: "Iams", price: "24.99", cost: "14.00", stock: 22, minStock: 10, weight: "2kg" },
    { sku: "CT-SCR", name: "Catit Scratcher Toy", category: "Accessories", brand: "Catit", price: "19.99", cost: "8.00", stock: 11, minStock: 5 },
  ];

  for (const p of products) {
    const exists = await db.select().from(productsTable).where(eq(productsTable.sku, p.sku));
    if (exists.length === 0) {
      await db.insert(productsTable).values(p);
    }
  }
  console.log("Products seeded.");

  // 3. Customers
  const customers = [
    { name: "Sarah Mitchell", phone: "0412 345 678", email: "sarah@email.com", area: "Bondi", group: "VIP", balance: "0", totalPurchases: "2840", visits: 34 },
    { name: "Tom Keller", phone: "0421 876 543", email: "tom.k@email.com", area: "Surry Hills", group: "Regular", balance: "140", totalPurchases: "1240", visits: 18 },
    { name: "Linda Park", phone: "0439 111 222", email: "linda.p@email.com", area: "Newtown", group: "Regular", balance: "100", totalPurchases: "860", visits: 11 },
    { name: "James Wong", phone: "0450 333 444", email: "jwong@email.com", area: "Pyrmont", group: "Wholesale", balance: "0", totalPurchases: "8920", visits: 82 },
    { name: "Emma Davis", phone: "0465 555 666", email: "emma.d@email.com", area: "Glebe", group: "VIP", balance: "420", totalPurchases: "3420", visits: 29 },
    { name: "Michael Chen", phone: "0478 777 888", email: "m.chen@email.com", area: "Darlinghurst", group: "Regular", balance: "0", totalPurchases: "540", visits: 7 },
    { name: "Olivia Brown", phone: "0491 999 000", email: "olivia.b@email.com", area: "Paddington", group: "VIP", balance: "0", totalPurchases: "4180", visits: 45 },
    { name: "David Lee", phone: "0412 111 333", email: "david.l@email.com", area: "Redfern", group: "Regular", balance: "200", totalPurchases: "680", visits: 9, status: "Inactive" },
  ];

  for (const c of customers) {
    const exists = await db.select().from(customersTable).where(eq(customersTable.email, c.email));
    if (exists.length === 0) {
      await db.insert(customersTable).values(c);
    }
  }
  console.log("Customers seeded.");

  // 4. Suppliers
  const suppliers = [
    { name: "Pet Supply Co", email: "orders@petsupply.com", phone: "02 9988 7766", balance: "0" },
    { name: "Royal Canin Australia", email: "sales@royalcanin.com.au", phone: "1300 655 855", balance: "0" },
    { name: "Hill's Pet Nutrition", email: "contact@hillspet.com", phone: "1800 679 932", balance: "0" },
    { name: "Purina Australia", email: "info@purina.com.au", phone: "1800 738 238", balance: "0" },
    { name: "Central Pet Distribution", email: "info@centralpet.com.au", phone: "02 8765 4321", balance: "0" },
  ];

  for (const s of suppliers) {
    const exists = await db.select().from(suppliersTable).where(eq(suppliersTable.name, s.name));
    if (exists.length === 0) {
      await db.insert(suppliersTable).values(s);
    }
  }
  console.log("Suppliers seeded.");

  // 5. Transactions (Historical)
  const existingTxns = await db.select().from(transactionsTable).limit(1);
  if (existingTxns.length === 0) {
    const seededProducts = await db.select().from(productsTable);
    const seededCustomers = await db.select().from(customersTable);
    
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const receiptNo = `POS-2024${(12-i).toString().padStart(2, '0')}01-${1000 + i}`;
      const customer = seededCustomers[i % seededCustomers.length];
      
      const [txn] = await db.insert(transactionsTable).values({
        receiptNo,
        customerId: customer.id,
        customerName: customer.name,
        subtotal: "100.00",
        discountPct: "0",
        discountAmt: "0",
        tax: "10.00",
        total: "110.00",
        paymentMethod: "card",
        status: "completed",
        createdAt: date,
      }).returning();

      // Add 2 items per transaction
      for (let j = 0; j < 2; j++) {
        const prod = seededProducts[(i + j) % seededProducts.length];
        await db.insert(transactionItemsTable).values({
          transactionId: txn.id,
          productId: prod.id,
          productName: prod.name,
          productBrand: prod.brand,
          sku: prod.sku,
          price: prod.price,
          qty: 1,
          lineTotal: prod.price,
        });
      }
    }
    console.log("Historical transactions seeded.");
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
