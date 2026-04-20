import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

const FR_CERT =
  "UL Certified to NFPA 2112, NFPA 70E, ASTM F1506, CAN/CGSB 155.20, CSA Z462, EN ISO 11611 Class 1";
const FR_MATERIAL = "FR/AR Hi-Vis fabric, OHSA compliant, orange high-visibility";
const HIVIS_ORANGE = "#ff6600";

const products = [
  {
    sku: "BM-5242OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Spring Jacket #5242OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-2153OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Bomber Jacket #2153OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-2151OR",
    name: "Atlas Guardian FR/AR Hi Vis OHSA Parka #2151OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-2152OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Insulated Bibs #2152OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-405NB",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Pant #405NB",
    category: "Electrical",
    sizes: "W/L",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-1052OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Coveralls #1052OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-3052O",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Summer Bibs #3052O",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-501OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Pullover Hoodie #501OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-502OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Zip Up Hoodie #502OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-503OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Henley Shirt #503OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-504OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Work Shirt #504OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-506OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis T-Shirt #506OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
  },
  {
    sku: "BM-507OR",
    name: "Atlas Guardian FR/AR OHSA Hi Vis Long Sleeve T-Shirt #507OR",
    category: "Electrical",
    sizes: "S - 5XL",
    badge: "",
    colors: JSON.stringify([HIVIS_ORANGE]),
    price: 0,
    material: FR_MATERIAL,
    details: FR_CERT,
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
        p.sku,
        p.name,
        p.category,
        p.sizes,
        p.badge,
        p.colors,
        p.price,
        "",
        JSON.stringify([]),
        p.material,
        p.details,
        null,
        sortOrder,
        "blackmcdonald",
      ],
    });
    console.log(`Inserted ${p.sku}: ${p.name} (sort_order: ${sortOrder})`);
    sortOrder++;
  }

  const count = await db.execute(
    "SELECT COUNT(*) as cnt FROM products WHERE vendor = 'blackmcdonald' AND category = 'Electrical'"
  );
  console.log(`\nTotal blackmcdonald Electrical products: ${count.rows[0].cnt}`);
}

insertProducts().catch(console.error);
