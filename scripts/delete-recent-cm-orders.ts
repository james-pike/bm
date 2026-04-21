import { createClient } from "@libsql/client";
import { config } from "dotenv";
config({ path: "/home/jvm/cm-admin/.env" });

const db = createClient({
  url: process.env.VITE_TURSO_URL || "",
  authToken: process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

async function run() {
  const before = await db.execute({
    sql: "SELECT id, vendor, emp_name, created_at FROM orders WHERE vendor LIKE 'carmichael%' ORDER BY id ASC",
  });
  console.log("All carmichael orders (seq = CM-N):");
  (before.rows as any[]).forEach((r, i) => {
    console.log(`  CM-${i + 1}  id=${r.id}  ${r.emp_name}  ${r.created_at}`);
  });

  // Delete orders at seq positions 3, 4, 5 (i.e. indexes 2,3,4)
  const rows = before.rows as any[];
  const toDelete = rows.slice(2, 5);
  if (toDelete.length === 0) {
    console.log("\nNothing at CM-3..CM-5.");
    return;
  }

  console.log("\nDeleting:");
  for (const r of toDelete) {
    console.log(`  id=${r.id}  ${r.emp_name}`);
    await db.execute({
      sql: "DELETE FROM orders WHERE id = ?",
      args: [r.id],
    });
  }

  const after = await db.execute({
    sql: "SELECT id, vendor, emp_name FROM orders WHERE vendor LIKE 'carmichael%' ORDER BY id ASC",
  });
  console.log("\nAfter:");
  (after.rows as any[]).forEach((r, i) => {
    console.log(`  CM-${i + 1}  id=${r.id}  ${r.emp_name}`);
  });
}

run().catch(console.error);
