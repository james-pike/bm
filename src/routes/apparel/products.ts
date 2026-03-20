import { t } from "../../i18n";
import type { Locale } from "../../i18n";

export const allProducts = [
  { sku: "CM-5", name: "Men's Soft Shell Jacket", category: "Jackets", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#4a4a4a", "#2c3e50"], price: 68, img: "/softshell/j7603 soft shell.png", imgs: ["/softshell/j7603 soft shell.png", "/softshell/l7603 ladies soft shell.png", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop"], material: "100% polyester with mechanical stretch, bonded micro fleece lining", details: "Water repellent, wind resistant, anti-pill, YKK zippers, 1000mm waterproof rating, classic fit" },
  { sku: "CM-6", name: "Women's Soft Shell Jacket", category: "Jackets", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#4a4a4a", "#2c3e50"], price: 68, img: "/softshell/l7603 ladies soft shell.png", imgs: ["/softshell/l7603 ladies soft shell.png", "/softshell/j7603 soft shell.png", "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop"], material: "100% polyester with mechanical stretch, bonded micro fleece lining", details: "Water repellent, wind resistant, anti-pill, YKK zippers, 1000mm waterproof rating, classic fit" },
  { sku: "CM-1", name: "UA Men's Tech Polo", category: "Polos", sizes: "S - 4XL", badge: "", colors: ["#1a1a18", "#94a3b8"], price: 60, img: "/uapolo/car 1.png", imgs: ["/uapolo/car 1.png", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop"], material: "100% polyester", details: "Moisture-wicking, anti-odor technology, textured soft & breathable fabric, self-fabric collar, 3-button placket" },
  { sku: "CM-7", name: "Women's Golf Polo", category: "Polos", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#00703c", "#94a3b8"], price: 40, img: "/golf/green.png", imgs: ["/golf/green.png", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop"], material: "100% performance polyester flat tricot micropique", details: "Self-fabric collar, moisture-wicking, snag resistant, breathable, tagless, relaxed fit, ANSI/ISEA 107 high visibility compliant (select colors)" },
  { sku: "CM-14", name: "UA Women's Tech Polo", category: "Polos", sizes: "S - 4XL", badge: "", colors: ["#1a1a18", "#94a3b8"], price: 60, img: "/uapolo/womens-white.png", imgs: ["/uapolo/womens-white.png", "/uapolo/car 1.png", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop"], material: "100% polyester", details: "Moisture-wicking, anti-odor technology, textured soft & breathable fabric, self-fabric collar, 3-button placket" },
  { sku: "CM-13", name: "Embroidered Cap", category: "Hats", sizes: "One Size", badge: "Popular", colors: ["#00703c", "#1a1a18", "#2c3e50"], price: 24, img: "/hat/30109107PS2_FRONT.JPG", imgs: ["/hat/30109107PS2_FRONT.JPG", "/hat/30109107PS2_BACK.JPG", "/beanie/1.png", "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=400&fit=crop"], pdf: "/hat/30131741.pdf", material: "", details: "" },
  { sku: "CM-2", name: "Men's Snag Resistant Polo", category: "Polos", sizes: "XS - 4XL", badge: "", colors: ["#1a1a18", "#94a3b8"], price: 40, img: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=440&h=330&fit=crop", imgs: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop"], material: "100% performance polyester micropique", details: "Snag resistant, moisture-wicking, breathable, tagless, rib knit collar, classic fit" },
  { sku: "CM-10", name: "Men's Alpine Fleece", category: "Jackets", sizes: "XS - 4XL", badge: "New", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 120, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", imgs: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop", "/softshell/j7603 soft shell.png", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&h=400&fit=crop"], material: "60% Cotton / 40% Acrylic", details: "Full zip, heavyweight cuffs & hem, stand-up collar, long sleeves, FW branded zipper pull" },
  { sku: "CM-11", name: "Women's Alpine Fleece", category: "Jackets", sizes: "XS - 3XL", badge: "New", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 120, img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=440&h=330&fit=crop", imgs: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=400&fit=crop", "/softshell/l7603 ladies soft shell.png", "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=400&fit=crop", "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=400&fit=crop"], material: "60% Cotton / 40% Acrylic", details: "Full zip, heavyweight cuffs & hem, stand-up collar, long sleeves, FW branded zipper pull" },
  { sku: "CM-12", name: "Flip Toque", category: "Hats", sizes: "One Size", badge: "", colors: ["#1a1a18", "#2c3e50", "#4a4a4a"], price: 7, img: "/beanie/1.png", imgs: ["/beanie/1.png", "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600&h=400&fit=crop", "/hat/30109107PS2_FRONT.JPG"], material: "100% Acrylic", details: "Traditional knit hat with cuff, one size fits most" },
];

export type Product = typeof allProducts[0];

export const categories = ["All", "Polos", "Jackets", "Hats"];

export const badgeMap: Record<string, string> = {
  "Best Seller": "badge.bestseller",
  "New": "badge.new",
  "Staff Pick": "badge.staffpick",
  "Popular": "badge.popular",
  "Required": "badge.required",
};

export const badgeClassMap: Record<string, string> = {
  "New": "product-card__badge product-card__badge--orange",
  "Required": "product-card__badge product-card__badge--gold",
};

export const badgeClass = (badge: string) => badgeClassMap[badge] || "product-card__badge product-card__badge--green";

export const expandSizes = (sizeRange: string): string[] => {
  const all = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  if (sizeRange === "One Size") return ["One Size"];
  const parts = sizeRange.split(" - ").map((s) => s.trim());
  const start = all.indexOf(parts[0]);
  const end = all.indexOf(parts[1]);
  if (start === -1 || end === -1) return [sizeRange];
  return all.slice(start, end + 1);
};

export const colorKeyMap: Record<string, string> = {
  "#00703c": "color.green",
  "#1a1a18": "color.black",
  "#ffffff": "color.white",
  "#2c3e50": "color.navy",
  "#94a3b8": "color.grey",
  "#E6570C": "color.orange",
  "#e4ba3f": "color.yellow",
};

export const colorName = (hex: string, locale: Locale): string => {
  const key = colorKeyMap[hex];
  if (key) return t(key as any, locale);
  return hex;
};

export const categoryLabel = (cat: string, locale: Locale): string => {
  if (cat === "All") return t("apparel.all", locale);
  const key = `cat.${cat}` as any;
  return t(key, locale);
};
