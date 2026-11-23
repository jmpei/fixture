// S1: single round robin by the circle method (docs/league-rules.md).
export type Match = { home: string; away: string };
export type Round = Match[];

export function roundRobin(teamIds: string[]): Round[] {
  if (teamIds.length < 2) return [];
  // With an odd count, a fixed empty seat at index 0 gives each team one bye.
  const seats: (string | null)[] = teamIds.length % 2 === 0 ? [...teamIds] : [null, ...teamIds];
  const n = seats.length;
  const rounds: Round[] = [];

  for (let r = 0; r < n - 1; r++) {
    const round: Round = [];
    for (let i = 0; i < n / 2; i++) {
      const left = seats[i];
      const right = seats[n - 1 - i];
      if (left === null || right === null) continue;
      // The fixed seat alternates home and away; the others are home on the left half.
      const leftIsHome = i === 0 ? r % 2 === 0 : true;
      round.push(leftIsHome ? { home: left, away: right } : { home: right, away: left });
    }
    rounds.push(round);
    // Rotate every seat except the first one step clockwise.
    seats.splice(1, 0, seats.pop()!);
  }
  return rounds;
}
