const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

export function formatCurrency(value) {
  return `₹${currencyFormatter.format(Number(value) || 0)}`;
}

export function formatName(value) {
  if (!value) return '-';
  const rawValue = typeof value === 'object'
    ? value.name || value.fullName || value.username || value.email || ''
    : value;

  if (!rawValue) return '-';

  return String(rawValue)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/(^|[\s'-])([a-z])/g, (match, prefix, letter) => `${prefix}${letter.toUpperCase()}`);
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

export function formatPaidDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString("en-GB");
}

export function formatId(id) {
  if (!id) return '-';
  const idStr = String(id);
  if (idStr === '-' || idStr === 'N/A' || idStr === 'Unknown') return '-';
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
