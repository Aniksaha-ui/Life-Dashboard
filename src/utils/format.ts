/**
 * Formats a number to at most 2 decimal places.
 * If the number is an integer, it returns it as is.
 */
export const formatNumber = (
  value: number | string | null | undefined,
  decimals = 2,
): string => {
  if (value === null || value === undefined) return "0";

  const num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) return "0";

  // If it's a whole number, don't show decimals
  if (num % 1 === 0) return num.toLocaleString();

  // Use toLocaleString with maximumFractionDigits
  return num.toLocaleString(undefined, {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  });
};

/**
 * Specifically for formatting currency values
 */
export const formatCurrency = (
  value: number | string | null | undefined,
): string => {
  return `৳${formatNumber(value)}`;
};

/**
 * Specifically for formatting percentage values
 */
export const formatPercent = (
  value: number | string | null | undefined,
): string => {
  return `${formatNumber(value)}%`;
};
