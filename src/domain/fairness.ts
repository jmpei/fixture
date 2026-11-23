// F1 and F2 (docs/league-rules.md) over one division's games in local dates and times.
import type { Violation } from "./types";

export type ScheduledGame = { home: string; away: string; date: string; start: string };

/** F2: a game starting at this local time or later is late. */
const LATE_START = "21:00";
/** F2: the most and fewest late games in a division may differ by this much. */
const MAX_LATE_SPREAD = 1;

const plays = (team: string) => (game: ScheduledGame) => game.home === team || game.away === team;

export function checkFairness(teamIds: string[], games: ScheduledGame[]): Violation[] {
  return [...teamIds.flatMap((team) => checkBackToBack(team, games)), ...checkLateSpread(teamIds, games)];
}

function checkBackToBack(team: string, games: ScheduledGame[]): Violation[] {
  const dates = games.filter(plays(team)).map((game) => game.date).sort();
  const violations: Violation[] = [];
  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i - 1], dates[i]);
    if (gap === 0) violations.push({ ruleId: "F1", message: `${team} plays twice on ${dates[i]}` });
    if (gap === 1) violations.push({ ruleId: "F1", message: `${team} plays on ${dates[i - 1]} and ${dates[i]}` });
  }
  return violations;
}

function checkLateSpread(teamIds: string[], games: ScheduledGame[]): Violation[] {
  const late = teamIds.map((team) => ({
    team,
    count: games.filter(plays(team)).filter((game) => game.start >= LATE_START).length,
  }));
  if (late.length === 0) return [];
  const most = late.reduce((a, b) => (b.count > a.count ? b : a));
  const fewest = late.reduce((a, b) => (b.count < a.count ? b : a));
  if (most.count - fewest.count <= MAX_LATE_SPREAD) return [];
  return [
    {
      ruleId: "F2",
      message: `Late games are uneven: ${most.team} has ${most.count}, ${fewest.team} has ${fewest.count}`,
    },
  ];
}

/** Whole calendar days from one `YYYY-MM-DD` date to another; no time zone is involved. */
function daysBetween(from: string, to: string): number {
  const toUtc = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return (toUtc(to) - toUtc(from)) / 86_400_000;
}
