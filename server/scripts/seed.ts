import bcrypt from "bcryptjs";
import { connectDB } from "../db";
import { User, Customer, Supplier } from "../db";
import { nextId } from "../db";

async function seed() {
  await connectDB();
  console.log("Seeding POS-specific data (not touching MERN website products)...");

  // 1. Admin User (shared with MERN site's users collection)
  const adminExists = await User.findOne({ username: "admin" });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const id = await nextId("users");
    await User.create({ id, username: "admin", passwordHash, name: "Admin User", role: "admin", branch: "Main Branch" });
    console.log("Admin user created (POS).");
  } else {
    console.log("Admin user already exists.");
  }

  // 2. Customers
  const customerData = [
    { name: "Sarah Mitchell", phone: "0412 345 678", email: "sarah@email.com", area: "Bondi", group: "VIP", balance: 0, totalPurchases: 2840, visits: 34 },
    { name: "Tom Keller", phone: "0421 876 543", email: "tom.k@email.com", area: "Surry Hills", group: "Regular", balance: 140, totalPurchases: 1240, visits: 18 },
    { name: "Linda Park", phone: "0439 111 222", email: "linda.p@email.com", area: "Newtown", group: "Regular", balance: 100, totalPurchases: 860, visits: 11 },
    { name: "James Wong", phone: "0450 333 444", email: "jwong@email.com", area: "Pyrmont", group: "Wholesale", balance: 0, totalPurchases: 8920, visits: 82 },
    { name: "Emma Davis", phone: "0465 555 666", email: "emma.d@email.com", area: "Glebe", group: "VIP", balance: 420, totalPurchases: 3420, visits: 29 },
    { name: "Michael Chen", phone: "0478 777 888", email: "m.chen@email.com", area: "Darlinghurst", group: "Regular", balance: 0, totalPurchases: 540, visits: 7 },
    { name: "Olivia Brown", phone: "0491 999 000", email: "olivia.b@email.com", area: "Paddington", group: "VIP", balance: 0, totalPurchases: 4180, visits: 45 },
    { name: "David Lee", phone: "0412 111 333", email: "david.l@email.com", area: "Redfern", group: "Regular", balance: 200, totalPurchases: 680, visits: 9, status: "Inactive" },
  ];

  for (const c of customerData) {
    const exists = await Customer.findOne({ email: c.email });
    if (!exists) {
      const id = await nextId("customers");
      await Customer.create({ id, ...c });
    }
  }
  console.log("Customers seeded.");

  // 3. Suppliers
  const supplierData = [
    { name: "Pet Supply Co", email: "orders@petsupply.com", phone: "02 9988 7766", balance: 0 },
    { name: "Royal Canin Australia", email: "sales@royalcanin.com.au", phone: "1300 655 855", balance: 0 },
    { name: "Hill's Pet Nutrition", email: "contact@hillspet.com", phone: "1800 679 932", balance: 0 },
    { name: "Purina Australia", email: "info@purina.com.au", phone: "1800 738 238", balance: 0 },
    { name: "Central Pet Distribution", email: "info@centralpet.com.au", phone: "02 8765 4321", balance: 0 },
  ];

  for (const s of supplierData) {
    const exists = await Supplier.findOne({ name: s.name });
    if (!exists) {
      const id = await nextId("suppliers");
      await Supplier.create({ id, ...s });
    }
  }
  console.log("Suppliers seeded.");

  console.log("Seeding complete! Products come from the live MERN website database.");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
