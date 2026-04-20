import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

// Re-categorize every existing BM product that isn't already "Electrical" into "Good Catch".
async function run() {
  const before = await db.execute({
    sql: "SELECT sku, name, category FROM products WHERE vendor = 'blackmcdonald' ORDER BY sort_order ASC",
  });
  console.log("Before:");
  for (const r of before.rows as any[]) {
    console.log(`  ${r.sku} [${r.category}] ${r.name}`);
  }

  const res = await db.execute({
    sql: "UPDATE products SET category = 'Good Catch' WHERE vendor = 'blackmcdonald' AND category != 'Electrical'",
  });
  console.log(`\nUpdated ${res.rowsAffected} rows to category 'Good Catch'.`);

  const after = await db.execute({
    sql: "SELECT sku, name, category FROM products WHERE vendor = 'blackmcdonald' ORDER BY sort_order ASC",
  });
  console.log("\nAfter:");
  for (const r of after.rows as any[]) {
    console.log(`  ${r.sku} [${r.category}] ${r.name}`);
  }
}

run().catch(console.error);
