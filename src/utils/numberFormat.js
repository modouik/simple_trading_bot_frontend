export const formatNumber = (value, decimals = 8) => {
  if (value === null || value === undefined) return "0";

  const num =
    typeof value === "string"
      ? Number(value)
      : typeof value === "number"
      ? value
      : Number(value);

  if (Number.isNaN(num)) return "0";

  return num.toFixed(decimals);
};

