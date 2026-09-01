// utils/formatViews.js

export function formatViews(n) {
  if (n === undefined || n === null || isNaN(n)) return "0 views";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M views`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K views`;
  return `${n} views`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return ""; // invalid date

  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);

  // Future dates
  if (days < 0) return "In the future";

  if (days < 1)   return "Today";
  if (days < 7)   return `${days} day${days > 1 ? "s" : ""} ago`;
  if (days < 30)  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
}