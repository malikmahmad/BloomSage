export function formatPrice(amount) {
  return `Rs ${Number(amount).toLocaleString("en-PK")}`;
}

// SQLite stores datetimes without a timezone marker — appending "T" and "Z"
// forces the Date constructor to interpret them as UTC in all browsers
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
