import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

async function run() {
  const existing = await db.execute({
    sql: "SELECT sort_order FROM products WHERE sku = 'BMGC-8'",
  });
  const baseOrder = Number((existing.rows[0] as any)?.sort_order) || 8;

  const row = {
    sku: "BMGC-9",
    name: "Marquette 1/4-Zip Mock-Neck Sweatshirt - Black",
    category: "Good Catch",
    sizes: "S - 4XL",
    badge: "New",
    colors: JSON.stringify(["#1a1a18"]),
    price: 0,
    img: "",
    imgs: JSON.stringify([]),
    material: "10.5-ounce, 59% cotton / 41% polyester blend (Heather Gray: 70% cotton / 30% polyester)",
    details: "Mock neck collar, Quarter-length zipper with storm flap, Front handwarmer pocket, Stretchable spandex-reinforced rib-knit cuffs and waistband, Carhartt label sewn on pocket, Imported, #105294",
    vendor: "blackmcdonald",
    sort_order: baseOrder + 1,
  };

  const res = await db.execute({
    sql: `INSERT INTO products (sku, name, category, sizes, badge, colors, price, img, imgs, material, details, vendor, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      row.sku, row.name, row.category, row.sizes, row.badge, row.colors,
      row.price, row.img, row.imgs, row.material, row.details, row.vendor, row.sort_order,
    ],
  });
  console.log(`Inserted BMGC-9, rowsAffected=${res.rowsAffected}`);

  const after = await db.execute({
    sql: "SELECT sku, name, sort_order FROM products WHERE vendor = 'blackmcdonald' AND sku LIKE 'BMGC-%' ORDER BY sort_order ASC",
  });
  console.log("\nAll BMGC products:");
  for (const r of after.rows as any[]) {
    console.log(`  ${r.sku}  sort=${r.sort_order}  ${r.name}`);
  }
}

run().catch(console.error);
