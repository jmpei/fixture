// S1: single round robin (docs/league-rules.md).
import { describe, expect, it } from "vitest";
import { roundRobin, type Round } from "@/domain/round-robin";

const teams = (n: number) => Array.from({ length: n }, (_, i) => `t${i + 1}`);
const pairKey = (a: string, b: string) => [a, b].sort().join("-");
const allMatches = (rounds: Round[]) => rounds.flat();

describe("roundRobin (S1)", () => {
  it("returns no rounds for fewer than two teams", () => {
    expect(roundRobin([])).toEqual([]);
    expect(roundRobin(["t1"])).toEqual([]);
  });

  it("gives 4 teams 3 rounds of 2 games", () => {
    const rounds = roundRobin(teams(4));
    expect(rounds).toHaveLength(3);
    for (const round of rounds) expect(round).toHaveLength(2);
  });

  it.each([2, 3, 4, 5, 6, 7, 8])("pairs every team with every other team once (%i teams)", (n) => {
    const ids = teams(n);
    const keys = allMatches(roundRobin(ids)).map((m) => pairKey(m.home, m.away));
    const expected = ids.flatMap((a, i) => ids.slice(i + 1).map((b) => pairKey(a, b)));
    expect(keys.sort()).toEqual(expected.sort());
  });

  it.each([4, 5, 6, 7])("never has a team play twice in one round (%i teams)", (n) => {
    for (const round of roundRobin(teams(n))) {
      const playing = round.flatMap((m) => [m.home, m.away]);
      expect(new Set(playing).size).toBe(playing.length);
    }
  });

  it("gives 5 teams 5 rounds where every team sits out exactly once", () => {
    const ids = teams(5);
    const rounds = roundRobin(ids);
    expect(rounds).toHaveLength(5);
    const byes = rounds.map((round) => {
      const playing = new Set(round.flatMap((m) => [m.home, m.away]));
      return ids.filter((id) => !playing.has(id));
    });
    for (const sittingOut of byes) expect(sittingOut).toHaveLength(1);
    expect(byes.flat().sort()).toEqual([...ids].sort());
  });

  it.each([3, 4, 5, 6, 7, 8])("balances each team's home and away games within one (%i teams)", (n) => {
    const matches = allMatches(roundRobin(teams(n)));
    for (const id of teams(n)) {
      const home = matches.filter((m) => m.home === id).length;
      const away = matches.filter((m) => m.away === id).length;
      expect(Math.abs(home - away)).toBeLessThanOrEqual(1);
    }
  });
});
