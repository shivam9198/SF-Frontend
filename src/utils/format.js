const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  return `₹${currencyFormatter.format(Number(value) || 0)}`;
}

export function formatDate(value) {
  if (!value) return '-';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '-';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export function formatId(id) {
  if (!id) return '-';
  const idStr = String(id);
  // Check if it's already formatted
  if (idStr.startsWith('CUS-') || idStr.startsWith('LOAN-') || idStr.startsWith('PAY-')) {
    return idStr;
  }
  return `CUS-${idStr.slice(-6).toUpperCase()}`;
}

export function getDayPeriod() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 16) return "Afternoon";
  return "Evening";
}
