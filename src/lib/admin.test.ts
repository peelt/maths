import { describe, expect, it } from "vitest";
import { byMostRecent, formatSignInTime, toSignInRecords, type SignInRecord } from "./admin";

describe("formatSignInTime", () => {
  it("shows the date and the time", () => {
    expect(formatSignInTime("2026-09-12T15:04:00Z")).toBe("12 Sept 2026, 16:04");
  });

  it("reports UK time rather than the server's", () => {
    // The whole point of pinning the zone. Vercel runs in UTC, so a summer
    // sign-in formatted in the server's zone would read an hour early — and
    // would look entirely plausible.
    expect(formatSignInTime("2026-07-01T12:00:00Z")).toBe("1 Jul 2026, 13:00"); // BST
    expect(formatSignInTime("2026-01-01T12:00:00Z")).toBe("1 Jan 2026, 12:00"); // GMT
  });

  it("uses a 24 hour clock, so 13:00 cannot be misread", () => {
    expect(formatSignInTime("2026-01-01T22:30:00Z")).toContain("22:30");
  });

  it("says so plainly when there is no sign-in to show", () => {
    expect(formatSignInTime(null)).toBe("Never signed in");
  });

  it("does not print Invalid Date", () => {
    expect(formatSignInTime("not a date")).toBe("Unknown");
  });
});

describe("toSignInRecords", () => {
  it("reads the rows the database function returns", () => {
    expect(
      toSignInRecords([
        { email: "a@example.com", last_sign_in_at: "2026-09-01T10:00:00Z", first_seen_at: "2026-08-01T10:00:00Z" },
      ]),
    ).toEqual([
      { email: "a@example.com", lastSignInAt: "2026-09-01T10:00:00Z", firstSeenAt: "2026-08-01T10:00:00Z" },
    ]);
  });

  it("keeps an account that has never signed in", () => {
    // Someone who asked for a link and never clicked it is worth seeing.
    const [record] = toSignInRecords([
      { email: "b@example.com", last_sign_in_at: null, first_seen_at: "2026-08-01T10:00:00Z" },
    ]);
    expect(record.lastSignInAt).toBeNull();
  });

  it("returns nothing at all for a refused or empty call", () => {
    // A non-admin gets an error from the database, so the page has no rows.
    expect(toSignInRecords(null)).toEqual([]);
    expect(toSignInRecords(undefined)).toEqual([]);
    expect(toSignInRecords([])).toEqual([]);
    expect(toSignInRecords("nope")).toEqual([]);
  });

  it("drops a row with no usable email rather than rendering a blank line", () => {
    expect(toSignInRecords([{ email: "" }, { email: null }, {}])).toEqual([]);
  });
});

describe("byMostRecent", () => {
  const record = (email: string, lastSignInAt: string | null): SignInRecord => ({
    email,
    lastSignInAt,
    firstSeenAt: "2026-01-01T00:00:00Z",
  });

  it("puts the most recent sign-in first", () => {
    const sorted = byMostRecent([
      record("old@example.com", "2026-01-02T00:00:00Z"),
      record("new@example.com", "2026-09-02T00:00:00Z"),
    ]);
    expect(sorted.map((r) => r.email)).toEqual(["new@example.com", "old@example.com"]);
  });

  it("puts accounts that never signed in at the end", () => {
    const sorted = byMostRecent([
      record("never@example.com", null),
      record("once@example.com", "2026-01-02T00:00:00Z"),
    ]);
    expect(sorted.map((r) => r.email)).toEqual(["once@example.com", "never@example.com"]);
  });

  it("is stable, so the list does not shuffle between page loads", () => {
    const sorted = byMostRecent([
      record("b@example.com", null),
      record("a@example.com", null),
    ]);
    expect(sorted.map((r) => r.email)).toEqual(["a@example.com", "b@example.com"]);
  });

  it("does not modify what it was given", () => {
    const input = [record("b@example.com", "2026-01-01T00:00:00Z"), record("a@example.com", "2026-09-01T00:00:00Z")];
    byMostRecent(input);
    expect(input[0].email).toBe("b@example.com");
  });
});
