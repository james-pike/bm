import { createClient } from "@libsql/client";
import { config } from "dotenv";
import { writeFileSync } from "fs";

config();

const db = createClient({
  url: process.env.TURSO_URL || process.env.VITE_TURSO_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || process.env.VITE_TURSO_AUTH_TOKEN || undefined,
});

async function fetchAndWrite() {
  try {
    const result = await db.execute(
      "SELECT * FROM products WHERE vendor = 'blackmcdonald' ORDER BY sort_order ASC"
    );

    const products = result.rows.map((row: any) => ({
      sku: row.sku,
      name: row.name,
      category: row.category,
      sizes: row.sizes,
      badge: row.badge,
      colors: JSON.parse(row.colors || "[]"),
      price: row.price,
      img: row.img,
      imgs: JSON.parse(row.imgs || "[]"),
      material: row.material,
      details: row.details,
      pdf: row.pdf || undefined,
    }));

    const output = `// AUTO-GENERATED — do not edit manually. Updated from database at build time.
import { t } from "../../i18n";
import type { Locale } from "../../i18n";

export interface Product { sku: string; name: string; category: string; sizes: string; badge: string; colors: string[]; price: number; img: string; imgs: string[]; material: string; details: string; pdf?: string; }

export const allProducts: Product[] = ${JSON.stringify(products, null, 2)};

export const categories = ["All", ...Array.from(new Set(allProducts.map((p) => p.category)))];

export const badgeMap: Record<string, string> = { New: "badge.new", Popular: "badge.popular" };
export function badgeClass(badge: string) {
  return badge === "New" ? "product-card__badge product-card__badge--new" : "product-card__badge product-card__badge--popular";
}

const colorNames: Record<string, Record<string, string>> = {
  "#00703c": { en: "Green", fr: "Vert" },
  "#1a1a18": { en: "Black", fr: "Noir" },
  "#ffffff": { en: "White", fr: "Blanc" },
  "#2c3e50": { en: "Navy", fr: "Marine" },
  "#94a3b8": { en: "Silver", fr: "Argent" },
  "#4a4a4a": { en: "Grey", fr: "Gris" },
  "#6b6b6b": { en: "Grey", fr: "Gris" },
  "#E6570C": { en: "Orange", fr: "Orange" },
  "#ff6600": { en: "Orange", fr: "Orange" },
  "#e4ba3f": { en: "Yellow", fr: "Jaune" },
};
export function colorName(hex: string, locale: Locale): string {
  return colorNames[hex]?.[locale] || hex;
}

export function categoryLabel(cat: string, locale: Locale): string {
  if (cat === "All") return t("apparel.all", locale);
  const key = \`cat.\${cat}\` as any;
  return t(key, locale);
}

export function expandSizes(sizes: string): string[] {
  if (sizes === "One Size") return ["One Size"];
  const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"];
  const match = sizes.match(/^(\\w+)\\s*-\\s*(\\w+)$/);
  if (!match) return [sizes];
  const start = order.indexOf(match[1]);
  const end = order.indexOf(match[2]);
  if (start === -1 || end === -1) return [sizes];
  return order.slice(start, end + 1);
}
`;

    writeFileSync("src/routes/apparel/products.ts", output);
    console.log(`Wrote ${products.length} products from database`);
  } catch (e: any) {
    console.error("Failed to fetch from database, keeping existing products.ts:", e.message);
    // Don't fail the build — keep the existing hardcoded file
  }
}

fetchAndWrite();
