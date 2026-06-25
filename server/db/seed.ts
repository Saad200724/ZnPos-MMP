import bcrypt from "bcryptjs";
import { User, Customer, Supplier, Product, Category } from "./models";
import { nextId } from "./models/Counter";
import { logger } from "../lib/logger";

export async function ensureSeeded() {
  try {
    await ensureAdmin();
    await ensureCategories();
    await ensureProducts();
    await ensureCustomers();
    await ensureSuppliers();
    logger.info("Database seed check complete.");
  } catch (err) {
    logger.error({ err }, "Seed check failed — continuing anyway.");
  }
}

async function ensureAdmin() {
  let admin = await User.findOne({ username: "admin" });

  if (!admin) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const id = await nextId("users");
    await User.create({
      id,
      username: "admin",
      passwordHash,
      name: "Admin User",
      role: "admin",
      branch: "Main Branch",
    });
    logger.info("Admin user created.");
    return;
  }

  const hash = admin.passwordHash ?? admin.password;
  if (!hash) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await User.updateOne({ username: "admin" }, { $set: { passwordHash } });
    logger.info("Admin password hash fixed.");
    return;
  }

  const valid = await bcrypt.compare("admin123", hash);
  if (!valid) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await User.updateOne({ username: "admin" }, { $set: { passwordHash } });
    logger.info("Admin password reset to default.");
  }
}

async function ensureCategories() {
  const cats = [
    { name: "Cat Food", slug: "cat-food", description: "Dry and wet food for cats" },
    { name: "Dog Food", slug: "dog-food", description: "Dry and wet food for dogs" },
    { name: "Treats & Snacks", slug: "treats-snacks", description: "Treats for all pets" },
    { name: "Accessories", slug: "accessories", description: "Collars, leads, and toys" },
  ];
  for (const c of cats) {
    const exists = await Category.findOne({ slug: c.slug });
    if (!exists) await Category.create(c);
  }
}

async function ensureProducts() {
  // Remove orphaned documents left from failed seeding (null unique keys)
  await Product.collection.deleteMany({ $or: [{ id: null }, { sku: null }] });

  const count = await Product.countDocuments();
  if (count >= 10) return;

  // Find the highest existing product id so we don't collide
  const top = await Product.findOne({}, {}, { sort: { id: -1 } });
  let nextProductId = (top?.id ?? 0) + 1;

  const catFood = await Category.findOne({ slug: "cat-food" });
  const dogFood = await Category.findOne({ slug: "dog-food" });
  const treats  = await Category.findOne({ slug: "treats-snacks" });
  const access  = await Category.findOne({ slug: "accessories" });

  const products = [
    {
      sku: "RC-CAT-ADULT-2KG",
      name: "Royal Canin Adult Cat 2kg",
      description: "Complete dry food for adult cats aged 1–7 years.",
      price: 28.99, originalPrice: 34.99,
      categoryId: catFood?._id, stockQuantity: 42, stockStatus: "In Stock",
      isOnSale: true, discount: 17, isBestseller: true,
      tags: ["cat", "dry food", "royal canin"],
    },
    {
      sku: "WH-CAT-TUNA-12PK",
      name: "Whiskas Tuna Pouches 12pk",
      description: "12 x 85g pouches of tuna in jelly for adult cats.",
      price: 14.49, originalPrice: 14.49,
      categoryId: catFood?._id, stockQuantity: 88, stockStatus: "In Stock",
      isBestseller: true,
      tags: ["cat", "wet food", "whiskas"],
    },
    {
      sku: "HS-CAT-INDOOR-1.6KG",
      name: "Hills Science Diet Cat 1.6kg",
      description: "Precisely balanced nutrition for indoor adult cats.",
      price: 32.50, originalPrice: 32.50,
      categoryId: catFood?._id, stockQuantity: 25, stockStatus: "In Stock",
      isNewProduct: true,
      tags: ["cat", "dry food", "hills"],
    },
    {
      sku: "PP-DOG-ADULT-3KG",
      name: "Purina Pro Plan Dog Adult 3kg",
      description: "High-protein chicken dry food for adult dogs.",
      price: 38.00, originalPrice: 45.00,
      categoryId: dogFood?._id, stockQuantity: 31, stockStatus: "In Stock",
      isOnSale: true, discount: 16, isBestseller: true,
      tags: ["dog", "dry food", "purina"],
    },
    {
      sku: "PED-DOG-BEEF-12PK",
      name: "Pedigree Beef Chunks 12pk",
      description: "12 x 100g beef chunks in gravy for adult dogs.",
      price: 16.99, originalPrice: 16.99,
      categoryId: dogFood?._id, stockQuantity: 60, stockStatus: "In Stock",
      tags: ["dog", "wet food", "pedigree"],
    },
    {
      sku: "RC-DOG-MINI-PUP-2KG",
      name: "Royal Canin Mini Puppy 2kg",
      description: "Complete nutrition for small breed puppies up to 10 months.",
      price: 33.95, originalPrice: 33.95,
      categoryId: dogFood?._id, stockQuantity: 18, stockStatus: "In Stock",
      isNewProduct: true,
      tags: ["dog", "puppy", "royal canin"],
    },
    {
      sku: "TMP-CAT-TREATS-85G",
      name: "Temptations Cat Treats 85g",
      description: "Crunchy outside, soft inside — irresistible cat treats.",
      price: 5.49, originalPrice: 5.49,
      categoryId: treats?._id, stockQuantity: 120, stockStatus: "In Stock",
      isBestseller: true,
      tags: ["cat", "treats"],
    },
    {
      sku: "GRN-DOG-DENTAL-130G",
      name: "Greenies Dental Dog Treats 130g",
      description: "Clinically proven to clean teeth with every chew.",
      price: 11.99, originalPrice: 14.99,
      categoryId: treats?._id, stockQuantity: 55, stockStatus: "In Stock",
      isOnSale: true, discount: 20,
      tags: ["dog", "treats", "dental"],
    },
    {
      sku: "ACC-CAT-FEATHERWAND",
      name: "Cat Feather Wand Toy",
      description: "Interactive feather wand to keep cats active and entertained.",
      price: 8.99, originalPrice: 8.99,
      categoryId: access?._id, stockQuantity: 40, stockStatus: "In Stock",
      tags: ["cat", "toy", "accessories"],
    },
    {
      sku: "ACC-DOG-COLLAR-MED",
      name: "Adjustable Dog Collar — Medium",
      description: "Durable nylon collar with quick-release buckle, fits 30–50 cm necks.",
      price: 12.95, originalPrice: 12.95,
      categoryId: access?._id, stockQuantity: 35, stockStatus: "In Stock",
      tags: ["dog", "collar", "accessories"],
    },
  ];

  for (const p of products) {
    const exists = await Product.findOne({ name: p.name });
    if (!exists) {
      await Product.collection.insertOne({ id: nextProductId++, ...p, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    }
  }
  logger.info("10 test products seeded.");
}

async function ensureCustomers() {
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
}

async function ensureSuppliers() {
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
}
