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

export function standings(teamIds: string[], results: GameResult[]): StandingRow[] {
  const rows = new Map<string, StandingRow>(
    teamIds.map((teamId) => [
      teamId,
      { teamId, played: 0, wins: 0, ties: 0, losses: 0, points: 0, pointsFor: 0, pointsAgainst: 0, differential: 0 },
    ]),
  );

  for (const g of results) {
    record(rows.get(g.home)!, g.homeScore, g.awayScore);
    record(rows.get(g.away)!, g.awayScore, g.homeScore);
  }

  const registration = new Map(teamIds.map((id, i) => [id, i]));
  const byPoints = [...rows.values()].sort(
    (a, b) => b.points - a.points || registration.get(a.teamId)! - registration.get(b.teamId)!,
  );

  const ordered: StandingRow[] = [];
  for (let i = 0; i < byPoints.length; ) {
    let j = i;
    while (j < byPoints.length && byPoints[j].points === byPoints[i].points) j++;
    const group = byPoints.slice(i, j);
    const ids = new Set(group.map((r) => r.teamId));
    const h2h = new Map(group.map((r) => [r.teamId, 0]));
    for (const g of results) {
      if (!ids.has(g.home) || !ids.has(g.away)) continue;
      if (g.homeScore > g.awayScore) h2h.set(g.home, h2h.get(g.home)! + 2);
      else if (g.homeScore < g.awayScore) h2h.set(g.away, h2h.get(g.away)! + 2);
      else {
        h2h.set(g.home, h2h.get(g.home)! + 1);
        h2h.set(g.away, h2h.get(g.away)! + 1);
      }
    }
    group.sort(
      (a, b) =>
        h2h.get(b.teamId)! - h2h.get(a.teamId)! ||
        b.differential - a.differential ||
        registration.get(a.teamId)! - registration.get(b.teamId)!,
    );
    ordered.push(...group);
    i = j;
  }
  return ordered;
}

function record(row: StandingRow, scored: number, conceded: number) {
  row.played++;
  row.pointsFor += scored;
  row.pointsAgainst += conceded;
  row.differential = row.pointsFor - row.pointsAgainst;
  if (scored > conceded) {
    row.wins++;
    row.points += 2;
  } else if (scored < conceded) {
    row.losses++;
  } else {
    row.ties++;
    row.points += 1;
  }
}
