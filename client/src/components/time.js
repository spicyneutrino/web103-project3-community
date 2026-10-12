export function countdown(date, now = Date.now()) {
  const delta = new Date(date).getTime() - now;
  if (delta <= 0) return "Past event";
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Starts in less than a minute";
  const days = Math.floor(minutes / 1440),
    hours = Math.floor((minutes % 1440) / 60),
    mins = minutes % 60;
  return `Starts in ${days ? `${days}d ` : ""}${hours}h ${mins}m`;
}
