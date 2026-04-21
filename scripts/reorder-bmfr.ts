import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

async function run() {
  const current = await db.execute({
    sql: "SELECT sku, sort_order FROM products WHERE sku LIKE 'BMFR-%' ORDER BY sort_order ASC",
  });
  console.log("Before:");
  for (const r of current.rows as any[]) console.log(`  ${r.sku}  sort_order=${r.sort_order}`);

  const rows = current.rows as any[];
  const minOrder = Math.min(...rows.map((r) => Number(r.sort_order)));
  const maxOrder = Math.max(...rows.map((r) => Number(r.sort_order)));

  await db.execute({
    sql: "UPDATE products SET sort_order = ? WHERE sku = 'BMFR-5'",
    args: [minOrder - 1],
  });
  await db.execute({
    sql: "UPDATE products SET sort_order = ? WHERE sku = 'BMFR-2'",
    args: [maxOrder + 1],
  });

  const after = await db.execute({
    sql: "SELECT sku, sort_order FROM products WHERE sku LIKE 'BMFR-%' ORDER BY sort_order ASC",
  });
  console.log("\nAfter:");
  for (const r of after.rows as any[]) console.log(`  ${r.sku}  sort_order=${r.sort_order}`);
}

run().catch(console.error);
