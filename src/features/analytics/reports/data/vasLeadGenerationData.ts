export const VAS_LEAD_MERCHANT_POOL = [
  "Netro Model School & College",
  "Welcome Electronic",
  "Meem Water Technology",
  "Green Delta Insurance",
  "Style Boutique BD",
  "Dhaka Food Court",
  "Tech Haven Ltd",
  "City Mart Online",
  "Prime Logistics",
  "Smart Health Clinic",
  "Urban Fashion Hub",
  "Digital Pay Solutions",
  "Fresh Grocery BD",
  "Metro Electronics",
  "Sunrise Academy",
  "Cloud Kitchen Express",
  "Safe Travel Agency",
  "Bright Mobile Store",
];

export function resolveVasLeadMerchants(
  count: number,
  pool = VAS_LEAD_MERCHANT_POOL,
): string[] {
  if (count <= 0) return [];

  const source = pool.length > 0 ? pool : VAS_LEAD_MERCHANT_POOL;

  if (count <= source.length) {
    return source.slice(0, count);
  }

  return Array.from(
    { length: count },
    (_, index) => source[index % source.length],
  );
}
