// F1 and F2 (docs/league-rules.md) over one division's games in local dates and times.
import type { Violation } from "./types";

export type ScheduledGame = { home: string; away: string; date: string; start: string };

export function checkFairness(teamIds: string[], games: ScheduledGame[]): Violation[] {
  const violations: Violation[] = [];

  for (const team of teamIds) {
    const dates = games
      .filter((game) => game.home === team || game.away === team)
      .map((game) => game.date)
      .sort();
    for (let i = 1; i < dates.length; i++) {
      const [y1, m1, d1] = dates[i - 1].split("-").map(Number);
      const [y2, m2, d2] = dates[i].split("-").map(Number);
      const days = (Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000;
      if (days === 0) violations.push({ ruleId: "F1", message: `${team} plays twice on ${dates[i]}` });
      else if (days === 1)
        violations.push({ ruleId: "F1", message: `${team} plays on ${dates[i - 1]} and ${dates[i]}` });
    }
  }

  const late = teamIds.map((team) => ({
    team,
    count: games.filter((game) => (game.home === team || game.away === team) && game.start >= "21:00").length,
  }));
  if (late.length > 0) {
    const most = late.reduce((a, b) => (b.count > a.count ? b : a));
    const fewest = late.reduce((a, b) => (b.count < a.count ? b : a));
    if (most.count - fewest.count > 1) {
      violations.push({
        ruleId: "F2",
        message: `Late games are uneven: ${most.team} has ${most.count}, ${fewest.team} has ${fewest.count}`,
      });
    }
  }
  return violations;
}
