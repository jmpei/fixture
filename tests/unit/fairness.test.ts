// F1 (no back-to-back days) and F2 (late games spread evenly), docs/league-rules.md.
// Dates and times are local to the league, so these tests never use UTC offsets.
import { describe, expect, it } from "vitest";
import { checkFairness, type ScheduledGame } from "@/domain/fairness";

const g = (home: string, away: string, date: string, start = "19:00"): ScheduledGame => ({
  home,
  away,
  date,
  start,
});
const rules = (teamIds: string[], games: ScheduledGame[]) =>
  checkFairness(teamIds, games).map((v) => v.ruleId);

describe("checkFairness F1: no back-to-back days", () => {
  it("accepts games two days apart", () => {
    expect(checkFairness(["a", "b"], [g("a", "b", "2027-01-12"), g("b", "a", "2027-01-14")])).toEqual([]);
  });

  it("flags a team playing on consecutive dates, naming the team and both dates", () => {
    const violations = checkFairness(["a", "b", "c"], [g("a", "b", "2027-01-12"), g("c", "a", "2027-01-13")]);
    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe("F1");
    expect(violations[0].message).toContain("a");
    expect(violations[0].message).toContain("2027-01-12");
    expect(violations[0].message).toContain("2027-01-13");
  });

  it("flags a team playing twice on the same date", () => {
    expect(rules(["a", "b", "c"], [g("a", "b", "2027-01-12", "18:00"), g("a", "c", "2027-01-12", "20:00")])).toEqual([
      "F1",
    ]);
  });

  it("counts consecutive dates across a month end", () => {
    expect(rules(["a", "b", "c"], [g("a", "b", "2027-01-31"), g("c", "a", "2027-02-01")])).toEqual(["F1"]);
  });

  it("reports each back-to-back pair once, whatever order the games come in", () => {
    const games = [g("a", "c", "2027-01-14"), g("a", "b", "2027-01-12"), g("b", "c", "2027-01-16"), g("d", "a", "2027-01-13")];
    expect(rules(["a", "b", "c", "d"], games)).toEqual(["F1", "F1"]);
  });
});

describe("checkFairness F2: late games spread evenly", () => {
  it("counts a 21:00 start as late but not 20:59", () => {
    const at2059 = [g("a", "b", "2027-01-12", "20:59"), g("a", "b", "2027-01-15", "20:59")];
    const at2100 = [g("a", "b", "2027-01-12", "21:00"), g("a", "b", "2027-01-15", "21:00")];
    expect(rules(["a", "b", "c"], at2059)).toEqual([]);
    expect(rules(["a", "b", "c"], at2100)).toEqual(["F2"]);
  });

  it("accepts a difference of one late game between teams", () => {
    expect(rules(["a", "b", "c"], [g("a", "b", "2027-01-12", "21:30")])).toEqual([]);
  });

  it("counts teams with no games and names the most and fewest late teams", () => {
    const games = [g("a", "b", "2027-01-12", "22:00"), g("a", "c", "2027-01-15", "22:00")];
    const violations = checkFairness(["a", "b", "c", "d"], games);
    expect(violations.map((v) => v.ruleId)).toEqual(["F2"]);
    expect(violations[0].message).toContain("a has 2");
    expect(violations[0].message).toContain("d has 0");
  });
});
