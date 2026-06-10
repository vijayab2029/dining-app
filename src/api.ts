const BASE_URL = import.meta.env.VITE_API_URL;

async function apiFetch(path: string) {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

async function getLocations() {
  const data = await apiFetch("/menu/locations");
  if (!Array.isArray(data.supported_locations)) {
    throw new Error(
      "Expected supported_locations to be an array",
    );
  }
  return data;
}

async function getPeriods(location_name: string) {
  const data = await apiFetch(
    `/menu/periods?location_name=${encodeURIComponent(location_name)}`,
  );
  if (!Array.isArray(data)) {
    throw new Error(
      "Expected periods to be an array",
    );
  }
  return data;
}

async function getMenu(location: string, periodName: string) {
  const data = await apiFetch(
    `/menu/?location_name=${encodeURIComponent(location)}&period_name=${encodeURIComponent(periodName)}`,
  );
  if (!Array.isArray(data.categories)) {
    throw new Error(
      "Categories should be an array",
    );
  }
  return data;
}

export { getLocations, getPeriods, getMenu };