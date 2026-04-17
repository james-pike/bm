import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

const products = [
  {
    sku: "BM-100617-BLK",
    name: "Paxton 1/4 Zip Sweatshirt - Black",
    category: "Work Wear",
    sizes: "S - 4XL",
    badge: "New",
    colors: JSON.stringify(["#1a1a18"]),
    price: 69.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "13-ounce, 75% cotton / 25% polyester blend, Rain Defender DWR finish",
    details: "Rain Defender durable water repellent, Three-piece jersey-lined hood with drawcord, Mock neck collar with antique-finish brass zipper, Rib-knit cuffs and waist, Front handwarmer pocket with hidden security pocket, Carhartt patch on pocket, Loose fit, #100617",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-100617-GRY",
    name: "Paxton 1/4 Zip Sweatshirt - Grey",
    category: "Work Wear",
    sizes: "S - 4XL",
    badge: "New",
    colors: JSON.stringify(["#4a4a4a"]),
    price: 69.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "13-ounce, 55% cotton / 45% polyester blend (Carbon Heather), Rain Defender DWR finish",
    details: "Rain Defender durable water repellent, Three-piece jersey-lined hood with drawcord, Mock neck collar with antique-finish brass zipper, Rib-knit cuffs and waist, Front handwarmer pocket with hidden security pocket, Carhartt patch on pocket, Loose fit, #100617",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-102286-BLK",
    name: "Gilliam Vest - Black",
    category: "Jackets",
    sizes: "S - 3XL",
    badge: "",
    colors: JSON.stringify(["#1a1a18"]),
    price: 99.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "1.75-ounce, 100% nylon Cordura® with DWR coating, quilted nylon lining with 100g polyester insulation",
    details: "Cordura® fabric resists tears scuffs and abrasions, Rain Defender durable water repellent, Left-chest map pocket, Lower snap-button pockets, Inner zip and hook-and-loop pockets, Drawcord-adjustable droptail hem, #102286",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-104277-BLK",
    name: "Washed Duck Mock Neck Vest - Black",
    category: "Jackets",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify(["#1a1a18"]),
    price: 89.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "12-ounce, 100% ringspun washed cotton duck exterior, 100% polyester boucle sherpa lining",
    details: "Sherpa lining for warmth, Map pocket on left chest with zipper closure, Two large sherpa-lined front pockets, Two inside pockets, Droptail hem for added coverage, Machine washable cold gentle cycle, #104277",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-104277-GRY",
    name: "Washed Duck Mock Neck Vest - Grey",
    category: "Jackets",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify(["#4a4a4a"]),
    price: 89.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "12-ounce, 100% ringspun washed cotton duck exterior, 100% polyester boucle sherpa lining",
    details: "Sherpa lining for warmth, Map pocket on left chest with zipper closure, Two large sherpa-lined front pockets, Two inside pockets, Droptail hem for added coverage, Machine washable cold gentle cycle, #104277",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-102208-BLK",
    name: "Gilliam Jacket - Black",
    category: "Jackets",
    sizes: "S - 3XL",
    badge: "",
    colors: JSON.stringify(["#1a1a18"]),
    price: 109.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "1.75-ounce, 100% nylon Cordura® shell, 100g polyester insulation quilted to outer shell, nylon lining",
    details: "Rain Defender durable water repellent, Wind Fighter windproof technology, Mock-neck collar, Left-chest map pocket, Two lower-front pockets with hidden snap closure, Two inside pockets (one zippered one hook-and-loop), Hook-and-loop adjustable cuffs, Drawcord adjustable hem, Triple-stitched main seams, Relaxed fit, #102208",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-B0000546-BLK",
    name: "Insulated 12 Can Lunch Cooler - Black",
    category: "Accessories",
    sizes: "One Size",
    badge: "",
    colors: JSON.stringify(["#1a1a18"]),
    price: 42.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "600-denier polyester with Rain Defender durable water repellent, PEVA liner",
    details: "Fully insulated main compartment keeps contents cool up to 8 hours, Insulated top compartment for food separation, Front velcro pocket for condiments and utensils, Adjustable shoulder strap and top handle, Dimensions 10.5 x 9 x 6.5 inches, #B0000546",
    pdf: null,
    vendor: "blackmcdonald",
  },
  {
    sku: "BM-CB0280-BLK",
    name: "21L Classic Backpack - Black",
    category: "Accessories",
    sizes: "One Size",
    badge: "",
    colors: JSON.stringify(["#1a1a18"]),
    price: 49.99,
    img: "",
    imgs: JSON.stringify([]),
    material: "600-denier polyester with Rain Defender durable water repellent",
    details: "Large main compartment with dedicated 15-inch laptop sleeve, Front zippered compartment with organization, Reflective edge binding on sides, Reflective zipper puller, One side pocket, Comfort shoulder straps, Padded back panel, Dimensions 12 x 17.5 x 8 inches, #CB0280",
    pdf: null,
    vendor: "blackmcdonald",
  },
];

async function insertProducts() {
  const maxOrder = await db.execute(
    "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM products WHERE vendor = 'blackmcdonald'"
  );
  let sortOrder = Number(maxOrder.rows[0].max_order) + 1;

  for (const p of products) {
    const existing = await db.execute({
      sql: "SELECT sku FROM products WHERE sku = ?",
      args: [p.sku],
    });
    if (existing.rows.length > 0) {
      console.log(`Skipping ${p.sku} (already exists)`);
      continue;
    }

    await db.execute({
      sql: `INSERT INTO products (sku, name, category, sizes, badge, colors, price, img, imgs, material, details, pdf, sort_order, vendor)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        p.sku, p.name, p.category, p.sizes, p.badge,
        p.colors, p.price, p.img, p.imgs,
        p.material, p.details, p.pdf, sortOrder, p.vendor,
      ],
    });
    console.log(`Inserted ${p.sku}: ${p.name} (sort_order: ${sortOrder})`);
    sortOrder++;
  }

  const count = await db.execute(
    "SELECT COUNT(*) as cnt FROM products WHERE vendor = 'blackmcdonald'"
  );
  console.log(`\nTotal blackmcdonald products: ${count.rows[0].cnt}`);
}

insertProducts().catch(console.error);
