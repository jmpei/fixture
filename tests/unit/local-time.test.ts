// tzdata 2026e: America/Vancouver has been on permanent UTC-7 since 2026-03-08.
import { describe, expect, it } from "vitest";
import { localDateTime, toLocal } from "@/domain/local-time";

const TZ = "America/Vancouver";

describe("localDateTime", () => {
  it("reads a form's date and time as Vancouver wall-clock time", () => {
    expect(localDateTime("2027-01-12", "19:00", TZ).toISOString()).toBe("2027-01-13T02:00:00.000Z");
  });

  it("rejects malformed and impossible input", () => {
    expect(() => localDateTime("2027-13-40", "19:00", TZ)).toThrow();
    expect(() => localDateTime("2027-01-12", "25:00", TZ)).toThrow();
    expect(() => localDateTime("2027-1-12", "7:00", TZ)).toThrow();
  });
});

describe("toLocal", () => {
  it("round-trips with localDateTime, including a late game that is the next day in UTC", () => {
    expect(toLocal(localDateTime("2027-01-12", "22:30", TZ), TZ)).toEqual({ date: "2027-01-12", time: "22:30" });
  });
});
