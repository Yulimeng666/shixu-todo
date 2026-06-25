import { describe, expect, it } from "vitest";
import {
  compareOptionalIsoDatesAsc,
  isFutureDate,
  isPastDate,
  isSameCalendarDay,
  parseIsoDate,
} from "./dates";

const referenceDate = new Date("2026-06-24T10:00:00.000Z");

describe("date utilities", () => {
  it("parses valid ISO dates and rejects invalid values", () => {
    expect(parseIsoDate("2026-06-24T00:00:00.000Z")?.toISOString()).toBe(
      "2026-06-24T00:00:00.000Z",
    );
    expect(parseIsoDate("not-a-date")).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });

  it("detects same-day, future, and past dates by calendar day", () => {
    expect(isSameCalendarDay("2026-06-24T12:00:00.000Z", referenceDate)).toBe(
      true,
    );
    expect(isFutureDate("2026-06-25T00:00:00.000Z", referenceDate)).toBe(true);
    expect(isPastDate("2026-06-23T12:00:00.000Z", referenceDate)).toBe(true);
  });

  it("sorts missing dates after dated tasks", () => {
    expect(
      compareOptionalIsoDatesAsc(
        "2026-06-25T00:00:00.000Z",
        "2026-06-24T00:00:00.000Z",
      ),
    ).toBeGreaterThan(0);
    expect(compareOptionalIsoDatesAsc(undefined, "2026-06-24T00:00:00.000Z")).toBe(
      1,
    );
    expect(compareOptionalIsoDatesAsc(undefined, undefined)).toBe(0);
  });
});
