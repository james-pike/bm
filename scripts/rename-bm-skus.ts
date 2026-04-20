import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

// Map of current SKU → new SKU.
const renames: Record<string, string> = {
  // Good Catch (Safety) — renamed BM-1..8 → BMGC-1..8
  "BM-1": "BMGC-1",
  "BM-2": "BMGC-2",
  "BM-3": "BMGC-3",
  "BM-4": "BMGC-4",
  "BM-5": "BMGC-5",
  "BM-6": "BMGC-6",
  "BM-7": "BMGC-7",
  "BM-8": "BMGC-8",
  // Electrical — renamed to BMFR-1..13 (FR = Flame Resistant)
  "BM-5242OR": "BMFR-1",
  "BM-2153OR": "BMFR-2",
  "BM-2151OR": "BMFR-3",
  "BM-2152OR": "BMFR-4",
  "BM-405NB": "BMFR-5",
  "BM-1052OR": "BMFR-6",
  "BM-3052O": "BMFR-7",
  "BM-501OR": "BMFR-8",
  "BM-502OR": "BMFR-9",
  "BM-503OR": "BMFR-10",
  "BM-504OR": "BMFR-11",
  "BM-506OR": "BMFR-12",
  "BM-507OR": "BMFR-13",
};

async function run() {
  for (const [oldSku, newSku] of Object.entries(renames)) {
    const res = await db.execute({
      sql: "UPDATE products SET sku = ? WHERE sku = ?",
      args: [newSku, oldSku],
    });
    console.log(`${oldSku} → ${newSku}: ${res.rowsAffected} row updated`);
  }

  const after = await db.execute({
    sql: "SELECT sku, name, category FROM products WHERE vendor = 'blackmcdonald' ORDER BY sort_order ASC",
  });
  console.log("\nAfter rename:");
  for (const r of after.rows as any[]) {
    console.log(`  ${r.sku} [${r.category}] ${r.name}`);
  }
}

run().catch(console.error);
