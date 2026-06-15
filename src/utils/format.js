const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  return `₹${currencyFormatter.format(Number(value) || 0)}`;
}

export function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDayPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 16) return "Afternoon";
  return "Evening";
}
