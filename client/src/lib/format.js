export function formatPrice(amount) {
  return `Rs ${Number(amount).toLocaleString("en-PK")}`;
}

// SQLite stores datetimes as "YYYY-MM-DD HH:MM:SS" without a timezone marker.
// Adding "T" and "Z" makes the Date constructor treat it as UTC consistently
// across browsers instead of being parsed as local time.
export function formatDate(dateString) {
  return new Date(dateString.replace(" ", "T") + "Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateString) {
  return new Date(dateString.replace(" ", "T") + "Z").toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
