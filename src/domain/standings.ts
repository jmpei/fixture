// S2: standings order (docs/league-rules.md).
export type GameResult = { home: string; away: string; homeScore: number; awayScore: number };

export type StandingRow = {
  teamId: string;
  played: number;
  wins: number;
  ties: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  differential: number;
};

const WIN_POINTS = 2;
const TIE_POINTS = 1;

/** Standings points a team earns from one game. */
function gamePoints(scored: number, conceded: number): number {
  if (scored > conceded) return WIN_POINTS;
  return scored === conceded ? TIE_POINTS : 0;
}

export function standings(teamIds: string[], results: GameResult[]): StandingRow[] {
  const rows = new Map(teamIds.map((teamId) => [teamId, emptyRow(teamId)]));
  for (const g of results) {
    record(rows.get(g.home), g.homeScore, g.awayScore);
    record(rows.get(g.away), g.awayScore, g.homeScore);
  }

  const registration = new Map(teamIds.map((id, i) => [id, i]));
  const byRegistration = (a: StandingRow, b: StandingRow) =>
    (registration.get(a.teamId) ?? 0) - (registration.get(b.teamId) ?? 0);

  const byPoints = [...rows.values()].sort((a, b) => b.points - a.points || byRegistration(a, b));
  return groupBy(byPoints, (row) => row.points).flatMap((group) => {
    const h2h = headToHeadPoints(group.map((row) => row.teamId), results);
    const h2hOf = (row: StandingRow) => h2h.get(row.teamId) ?? 0;
    return group.sort((a, b) => h2hOf(b) - h2hOf(a) || b.differential - a.differential || byRegistration(a, b));
  });
}

/** Points each team earned in games played only among `teamIds`. */
function headToHeadPoints(teamIds: string[], results: GameResult[]): Map<string, number> {
  const points = new Map(teamIds.map((id) => [id, 0]));
  for (const g of results) {
    const home = points.get(g.home);
    const away = points.get(g.away);
    if (home === undefined || away === undefined) continue;
    points.set(g.home, home + gamePoints(g.homeScore, g.awayScore));
    points.set(g.away, away + gamePoints(g.awayScore, g.homeScore));
  }
  return points;
}

/** Splits an already-sorted list into runs that share the same key. */
function groupBy<T>(items: T[], key: (item: T) => unknown): T[][] {
  const groups: T[][] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && key(last[0]) === key(item)) last.push(item);
    else groups.push([item]);
  }
  return groups;
}

function emptyRow(teamId: string): StandingRow {
  return { teamId, played: 0, wins: 0, ties: 0, losses: 0, points: 0, pointsFor: 0, pointsAgainst: 0, differential: 0 };
}

/** Adds one game to a team's row; results for teams outside the division are ignored. */
function record(row: StandingRow | undefined, scored: number, conceded: number) {
  if (!row) return;
  const points = gamePoints(scored, conceded);
  row.played++;
  row.pointsFor += scored;
  row.pointsAgainst += conceded;
  row.differential = row.pointsFor - row.pointsAgainst;
  row.points += points;
  if (points === WIN_POINTS) row.wins++;
  else if (points === TIE_POINTS) row.ties++;
  else row.losses++;
}
