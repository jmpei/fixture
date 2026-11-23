// S2: standings order (docs/league-rules.md). Win 2, tie 1, loss 0; then head-to-head
// among the tied teams, then point differential, then registration order.
import { describe, expect, it } from "vitest";
import { standings, type GameResult } from "@/domain/standings";

const game = (home: string, homeScore: number, away: string, awayScore: number): GameResult => ({
  home,
  away,
  homeScore,
  awayScore,
});
const order = (teamIds: string[], results: GameResult[]) =>
  standings(teamIds, results).map((row) => row.teamId);

describe("standings (S2)", () => {
  it("counts each team's record, points and scoring", () => {
    const rows = standings(["a", "b", "c"], [game("a", 3, "b", 1), game("b", 2, "c", 2)]);
    expect(rows).toEqual([
      { teamId: "a", played: 1, wins: 1, ties: 0, losses: 0, points: 2, pointsFor: 3, pointsAgainst: 1, differential: 2 },
      { teamId: "c", played: 1, wins: 0, ties: 1, losses: 0, points: 1, pointsFor: 2, pointsAgainst: 2, differential: 0 },
      { teamId: "b", played: 2, wins: 0, ties: 1, losses: 1, points: 1, pointsFor: 3, pointsAgainst: 5, differential: -2 },
    ]);
  });

  it("lists a team with no games with zeros", () => {
    const [row] = standings(["a"], []);
    expect(row).toMatchObject({ teamId: "a", played: 0, points: 0, differential: 0 });
  });

  it("ranks by points before anything else", () => {
    expect(order(["a", "b"], [game("a", 0, "b", 1)])).toEqual(["b", "a"]);
  });

  it("breaks a two-team tie by head-to-head even against a better differential", () => {
    // a and b both have 2 points; b has the better differential (+9 vs -4) but lost to a.
    const results = [game("a", 1, "b", 0), game("b", 10, "c", 0), game("d", 5, "a", 0), game("d", 3, "c", 0)];
    expect(order(["a", "b", "c", "d"], results)).toEqual(["d", "a", "b", "c"]);
  });

  it("falls back to differential when tied teams never met", () => {
    const results = [game("a", 3, "c", 0), game("b", 1, "d", 0)];
    expect(order(["a", "b", "c", "d"], results)).toEqual(["a", "b", "d", "c"]);
  });

  it("falls back to differential when head-to-head is a three-way cycle", () => {
    const results = [game("a", 2, "b", 1), game("b", 2, "c", 1), game("c", 5, "a", 1)];
    expect(order(["a", "b", "c"], results)).toEqual(["c", "b", "a"]);
  });

  it("counts head-to-head over the whole tied group, then differential inside it", () => {
    // a, b, c have 4 points. Among those three, a has 4 and b and c have 1 each;
    // a's overall differential is the worst of the three. d and e have 3 and never met.
    const results = [
      game("a", 1, "b", 0),
      game("a", 1, "c", 0),
      game("d", 9, "a", 0),
      game("e", 9, "a", 0),
      game("b", 2, "c", 2),
      game("b", 5, "d", 0),
      game("b", 1, "e", 1),
      game("c", 3, "e", 0),
      game("c", 0, "d", 0),
    ];
    expect(order(["a", "b", "c", "d", "e"], results)).toEqual(["a", "b", "c", "e", "d"]);
  });

  it("keeps registration order when teams are level on everything", () => {
    expect(order(["b", "a"], [game("a", 1, "b", 1)])).toEqual(["b", "a"]);
    expect(order(["x", "y"], [])).toEqual(["x", "y"]);
  });
});
