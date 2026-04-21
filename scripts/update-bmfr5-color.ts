import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

async function run() {
  const res = await db.execute({
    sql: "UPDATE products SET colors = ? WHERE sku = ?",
    args: [JSON.stringify(["#2c3e50"]), "BMFR-5"],
  });
  console.log(`BMFR-5: ${res.rowsAffected} row updated`);

  const after = await db.execute({
    sql: "SELECT sku, colors FROM products WHERE sku = 'BMFR-5'",
  });
  for (const r of after.rows as any[]) console.log(`  ${r.sku}  ${r.colors}`);
}

run().catch(console.error);
