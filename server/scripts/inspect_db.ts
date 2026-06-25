import mongoose from "mongoose";
const uri = "mongodb+srv://saadbintofayeltahsin:Saad20985@meowmeowpetshop.ypghsvp.mongodb.net/?retryWrites=true&w=majority&appName=MeowMeowPetShop";
await mongoose.connect(uri);
const db = mongoose.connection.db!;

// Delete POS-seeded products (those with numeric id field)
const del = await db.collection("products").deleteMany({ id: { $exists: true } });
console.log("Deleted POS products:", del.deletedCount);

// Also clean POS-only collections from the default db
const delCustomers = await db.collection("customers").deleteMany({ id: { $exists: true } });
const delSuppliers = await db.collection("suppliers").deleteMany({ id: { $exists: true } });
const delTxns = await db.collection("transactions").deleteMany({});
const delPurchases = await db.collection("purchases").deleteMany({});
const delSessions = await db.collection("sessions").deleteMany({});
const delCounters = await db.collection("counters").deleteMany({});
console.log("Deleted POS customers:", delCustomers.deletedCount);
console.log("Deleted POS suppliers:", delSuppliers.deletedCount);
console.log("Deleted POS transactions:", delTxns.deletedCount);
console.log("Deleted POS purchases:", delPurchases.deletedCount);
console.log("Deleted sessions:", delSessions.deletedCount);
console.log("Deleted counters:", delCounters.deletedCount);

// Verify MERN products remain
const remaining = await db.collection("products").countDocuments();
console.log("Remaining products (MERN):", remaining);

process.exit(0);
