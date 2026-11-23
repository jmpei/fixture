// S1: single round robin by the circle method (docs/league-rules.md).
export type Match = { home: string; away: string };
export type Round = Match[];

/** An empty seat: whoever is paired with it sits out that round. */
const BYE = null;
type Seat = string | typeof BYE;

export function roundRobin(teamIds: string[]): Round[] {
  if (teamIds.length < 2) return [];
  // With an odd count, a fixed bye in the first seat gives each team exactly one bye
  // and keeps every real team on the rotating seats, which balances home and away.
  const seats: Seat[] = teamIds.length % 2 === 0 ? [...teamIds] : [BYE, ...teamIds];
  const n = seats.length;

  return Array.from({ length: n - 1 }, (_, r) => {
    const round = pairSeats(seats, r);
    rotate(seats);
    return round;
  });
}

/** Pairs seat i with seat n-1-i. The first seat alternates home and away by round; the
 * others are home while on the left half, and each team spends equal time on each half. */
function pairSeats(seats: Seat[], roundIndex: number): Round {
  const n = seats.length;
  const round: Round = [];
  for (let i = 0; i < n / 2; i++) {
    const left = seats[i];
    const right = seats[n - 1 - i];
    if (left === BYE || right === BYE) continue;
    const leftIsHome = i > 0 || roundIndex % 2 === 0;
    round.push(leftIsHome ? { home: left, away: right } : { home: right, away: left });
  }
  return round;
}

/** Keeps the first seat fixed and moves every other seat one step clockwise. */
function rotate(seats: Seat[]): void {
  const last = seats.pop();
  if (last !== undefined) seats.splice(1, 0, last);
}
