async function request(path, signal) {
  const response = await fetch(`/api${path}`, { signal });
  if (!response.ok) {
    const error = new Error(
      "Could not load events. Check your connection and try again.",
    );
    error.status = response.status;
    throw error;
  }
  return response.json();
}
export const getLocations = (signal) => request("/locations", signal);
export const getLocation = (slug, signal) =>
  request(`/locations/${encodeURIComponent(slug)}`, signal);
export const getEvents = (slug, signal) =>
  request(
    `/events${slug ? `?location=${encodeURIComponent(slug)}` : ""}`,
    signal,
  );
