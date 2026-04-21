import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

// All BMFR SKUs (except BMFR-5 which uses waist/length) get XS - 7XL.
const skus = [
  "BMFR-1", "BMFR-2", "BMFR-3", "BMFR-4",
  "BMFR-6", "BMFR-7", "BMFR-8", "BMFR-9",
  "BMFR-10", "BMFR-11", "BMFR-12", "BMFR-13",
];

async function run() {
  for (const sku of skus) {
    const res = await db.execute({
      sql: "UPDATE products SET sizes = ? WHERE sku = ?",
      args: ["XS - 7XL", sku],
    });
    console.log(`${sku}: ${res.rowsAffected} row updated`);
  }

  const after = await db.execute({
    sql: "SELECT sku, sizes FROM products WHERE sku LIKE 'BMFR-%' ORDER BY sku",
  });
  console.log("\nAfter:");
  for (const r of after.rows as any[]) {
    console.log(`  ${r.sku}  ${r.sizes}`);
  }
}

run().catch(console.error);
