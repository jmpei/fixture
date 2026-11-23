# League rules

Rules the scheduler and standings must follow. Each has an ID that code, tests and violations use. They come from the project proposal (stories 2, 3 and 7); a new rule is added here before any code.

| ID | Rule | Details |
|---|---|---|
| S1 | Single round robin | In a division, every pair of teams meets exactly once. With an odd number of teams, one team sits out each round and every team sits out exactly once. Each team's home and away games differ by at most one |
| S2 | Standings order | A win is worth 2 points, a tie 1, a loss 0. Teams level on points are ordered by (1) points earned in games between the tied teams only (head-to-head), then (2) point differential over all games. Teams still level keep their registration order |
| F1 | No back-to-back days | A team never plays twice on the same date or on two consecutive dates |
| F2 | Late games spread evenly | A game starting at 21:00 local time or later is late. Across a division, the team with the most late games has at most one more than the team with the fewest |
| B1 | Blackout dates | A team is never scheduled on a date it submitted as a blackout |

## Interpretation notes

- Dates and times are local to the league's time zone (default `America/Vancouver`). Rule checks take local `YYYY-MM-DD` dates and `HH:mm` times, so they never handle UTC offsets.
- S2 head-to-head looks at the whole tied group at once: for three tied teams, only the games among those three count.
- F1 and F2 are checked per division; teams in different divisions never play each other.
