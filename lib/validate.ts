export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function sanitizeString(str: unknown, maxLen = 500): string {
  if (typeof str !== "string") return "";
  return str.trim().slice(0, maxLen);
}

export function sanitizeNumber(val: unknown): number {
  const n = Number(val);
  return isNaN(n) || n < 0 ? 0 : n;
}

const VALID_STATUSES = ["DRAFT", "SENT", "PAID", "OVERDUE"] as const;
export type InvoiceStatus = (typeof VALID_STATUSES)[number];

export function isValidStatus(status: string): status is InvoiceStatus {
  return VALID_STATUSES.includes(status as InvoiceStatus);
}

const VALID_CURRENCIES = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"];
export function isValidCurrency(currency: string): boolean {
  return VALID_CURRENCIES.includes(currency);
}

export function sanitizePrompt(prompt: string): string {
  return prompt
    .trim()
    .slice(0, 500)
    .replace(/[<>{}]/g, "");
}
