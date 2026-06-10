import { describe, it, expect, vi, afterEach } from "vitest";
import { getLocations, getPeriods, getMenu } from "./api";
afterEach(() => {
  vi.restoreAllMocks();
});
function mockFetchSuccess(data: unknown) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}
function mockFetchFailure(status = 404, statusText = "Not Found") {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status,
    statusText,
  });
}
describe("getLocations", () => {
  it("fetches and return locations", async () => {
    mockFetchSuccess({
      supported_locations: ["stetson east", "international village", "60 belvidere"],
    });
    const result = await getLocations();
    expect(result.supported_locations).toHaveLength(3);
    expect(result.supported_locations).toContain("stetson east");
  });
  it("should throw error for failed response", async () => {
    mockFetchFailure();
    await expect(getLocations()).rejects.toThrow("API request failed");
  });
  it("throws error if supported_locations is not an array", async () => {
    mockFetchSuccess({ supported_locations: "stetson east" });
    await expect(getLocations()).rejects.toThrow(
      "Expected supported_locations to be an array",
    );
  });
  it("should return empty locations list", async () => {
    mockFetchSuccess({ supported_locations: [] });
    const result = await getLocations();
    expect(result.supported_locations).toHaveLength(0);
  });
});
describe("getPeriods", () => {
  it("should fetch and return periods", async () => {
    mockFetchSuccess([{ id: "123", name: "Breakfast", slug: "breakfast" }]);
    const result = await getPeriods("stetson east");
    expect(result).toHaveLength(1);
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Breakfast" })]),
    );
  });
  it("throws error on failed response", async () => {
    mockFetchFailure();
    await expect(getPeriods("stetson east")).rejects.toThrow(
      "API request failed",
    );
  });
  it("should throw error if periods not an array", async () => {
    mockFetchSuccess("not an array" as unknown);
    await expect(getPeriods("stetson east")).rejects.toThrow(
      "Expected periods to be an array",
    );
  });
  it("should return empty list", async () => {
    mockFetchSuccess([]);
    const result = await getPeriods("stetson east");
    expect(result).toHaveLength(0);
  });
});
describe("getMenu", () => {
  it("should fetch and return menu", async () => {
    mockFetchSuccess({
      categories: [
        {
          name: "RICE STATION",
          items: [{ name: "White Rice", calories: 110 }],
        },
      ],
    });
    const result = await getMenu("stetson east", "Breakfast");
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({ name: "RICE STATION" });
  });
  it("throws error for failed response", async () => {
    mockFetchFailure();
    await expect(getMenu("stetson east", "Breakfast")).rejects.toThrow(
      /API request failed/i,
    );
  });
  it("throws error if categories is not an array", async () => {
    mockFetchSuccess({ categories: "not an array" });
    await expect(getMenu("stetson east", "Breakfast")).rejects.toThrow(
      "Categories should be an array",
    );
  });
  it("should return empty categories list", async () => {
    mockFetchSuccess({ categories: [] });
    const result = await getMenu("stetson east", "Breakfast");
    expect(result.categories).toHaveLength(0);
  });
});