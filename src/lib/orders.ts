/**
 * Shared order helpers for the purchase-order checkout. The confirmation email
 * is built here from a fully-computed order object. Customer email/phone are
 * passed in per-call and are never stored in our DB, consistent with the
 * privacy policy.
 */
import { Resend } from "resend";
import { SHOW_PRICES } from "./pricing";
import { colorName as colorLabel } from "../routes/apparel/products";

export interface OrderItem {
  name: string;
  sku?: string | null;
  code?: string | null;
  color?: string | null; // hex like "#1a1a18" or a plain name
  size?: string | null;
  quantity: number;
  price: number;
  /** Logo-feature products (golf polos): the customer's chosen placement +
   *  style, shown on the confirmation email and kept in the order items JSON. */
  logoPosition?: string | null;
  logoStyle?: string | null;
}

export interface OrderEmailData {
  orderNumber: string;
  date: string;
  /** Absolute URL to the logo image shown in the email banner (e.g.
   *  https://site/favicon-512.png). Emails can't render the header's inline
   *  SVG, so we point at a hosted raster. Falls back to text if absent. */
  logoUrl?: string;
  employee: {
    name: string;
    email?: string;
    phone?: string;
    department?: string;
    provinceName: string;
    provinceCode: string;
    address1?: string;
    city?: string;
    postal?: string;
    po?: string;
  };
  items: OrderItem[];
  subtotal: number;
  taxPct: number;
  tax: number;
  total: number;
}

// Use the app's authoritative colour map (the same one the storefront/cart use)
// so every hex resolves to its label — e.g. "#ab8f66" -> "Dark Khaki" — instead
// of leaking a raw hex code into the email. English labels for the email.
const colorName = (hex: string) => colorLabel(hex, "en");

export function esc(s: string | undefined | null): string {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function buildOrderEmailHtml(o: OrderEmailData): string {
  const itemRows = o.items.map((i) =>
    `<tr>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${esc(i.name)}${i.code ? ` <span style="color:#000;font-weight:600;font-size:14px">${esc(i.code)}</span>` : i.sku ? ` <span style="color:#000;font-weight:600;font-size:14px">(${esc(i.sku)})</span>` : ""}${i.logoPosition ? `<br><span style="color:#999;font-size:12px">Logo: ${esc(i.logoPosition)}${i.logoStyle ? ` · ${esc(i.logoStyle)}` : ""}</span>` : ""}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee">${i.color ? esc(i.color.startsWith("#") ? colorName(i.color) : i.color) + " / " : ""}${esc(i.size)}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
      ${SHOW_PRICES ? `<td style="padding:6px 12px;border-bottom:1px solid #eee;text-align:right">$${(((Number(i.price) || 0) * i.quantity)).toFixed(2)}</td>` : ""}
    </tr>`
  ).join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#e9e6df" style="background-color:#e9e6df;border-radius:8px 8px 0 0;-webkit-print-color-adjust:exact;print-color-adjust:exact">
        <tr>
          <td bgcolor="#e9e6df" style="background-color:#e9e6df;padding:18px 24px;-webkit-print-color-adjust:exact;print-color-adjust:exact">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
              ${o.logoUrl ? `<td style="padding-right:18px;vertical-align:middle"><img src="${esc(o.logoUrl)}" alt="Black &amp; McDonald Apparel" width="144" height="71" style="display:block;width:144px;height:71px;border:0"></td>` : ""}
              <td style="vertical-align:middle">
                ${o.orderNumber ? `<p style="color:#1f2326;margin:0;font-size:20px;font-weight:700;letter-spacing:0.04em">Order #${esc(o.orderNumber)}</p>` : ""}
              </td>
            </tr></table>
          </td>
        </tr>
      </table>
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
        <p style="margin:0 0 16px;font-size:16px">Thank you for your order!</p>
        <p style="margin:0 0 4px"><strong>Date:</strong> ${esc(o.date)}</p>
        <p style="margin:0 0 4px"><strong>Name:</strong> ${esc(o.employee.name)}</p>
        ${o.employee.email ? `<p style="margin:0 0 4px"><strong>Email:</strong> <a href="mailto:${esc(o.employee.email)}">${esc(o.employee.email)}</a></p>` : ""}
        ${o.employee.phone ? `<p style="margin:0 0 4px"><strong>Phone:</strong> ${esc(o.employee.phone)}</p>` : ""}
        ${o.employee.address1 ? `<p style="margin:0 0 4px"><strong>Street:</strong> ${esc(o.employee.address1)}</p>` : ""}
        ${o.employee.city ? `<p style="margin:0 0 4px"><strong>City:</strong> ${esc(o.employee.city)}</p>` : ""}
        <p style="margin:0 0 4px"><strong>Province:</strong> ${esc(o.employee.provinceName)}</p>
        ${o.employee.postal ? `<p style="margin:0 0 4px"><strong>Postal Code:</strong> ${esc(o.employee.postal)}</p>` : ""}
        ${o.employee.po ? `<p style="margin:0 0 4px"><strong>PO #:</strong> ${esc(o.employee.po)}</p>` : ""}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0">
        <table style="width:100%;border-collapse:collapse;font-size:16px">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left">Product</th>
              <th style="padding:8px 12px;text-align:left">Details</th>
              <th style="padding:8px 12px;text-align:center">Qty</th>
              ${SHOW_PRICES ? `<th style="padding:8px 12px;text-align:right">Total</th>` : ""}
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          ${SHOW_PRICES ? `<tfoot>
            <tr>
              <td colspan="3" style="padding:6px 12px;text-align:right">Subtotal</td>
              <td style="padding:6px 12px;text-align:right">$${o.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:6px 12px;text-align:right">Tax (${esc(o.employee.provinceCode)} ${o.taxPct}%)</td>
              <td style="padding:6px 12px;text-align:right">$${o.tax.toFixed(2)}</td>
            </tr>
            <tr>
              <td colspan="3" style="padding:10px 12px;text-align:right;font-weight:700">Total</td>
              <td style="padding:10px 12px;text-align:right;font-weight:700;color:#39627c">$${o.total.toFixed(2)}</td>
            </tr>
          </tfoot>` : ""}
        </table>
      </div>
    </div>
  `;
}

export interface SendEmailConfig {
  apiKey: string;
  from: string;
  staffAddresses: string[];
}

/**
 * Send the order confirmation. The customer is the visible recipient (To) and
 * staff is BCC'd; if there's no customer email, send To staff so the order
 * still arrives. Never throws — a failed email must not fail a paid order.
 */
export async function sendConfirmationEmail(cfg: SendEmailConfig, o: OrderEmailData): Promise<void> {
  const customerEmail = (o.employee.email || "").trim();
  const toAddresses = customerEmail ? [customerEmail] : cfg.staffAddresses;
  const bccAddresses = customerEmail ? cfg.staffAddresses : [];
  try {
    const resend = new Resend(cfg.apiKey);
    await resend.emails.send({
      from: cfg.from,
      to: toAddresses,
      ...(bccAddresses.length ? { bcc: bccAddresses } : {}),
      subject: `${o.orderNumber ? `#${o.orderNumber} — ` : ""}Apparel Order — ${o.employee.name} — ${o.date}`,
      html: buildOrderEmailHtml(o),
    });
  } catch (err) {
    console.error("Failed to send order email:", err);
  }
}
