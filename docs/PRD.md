# Fixture PRD

## Problem

University intramural leagues are scheduled by hand. Rec staff take the registered teams, the courts and fields they have, and the time slots the facility gives them, and build the season in a spreadsheet. Then captains email dates they can't play, a gym gets booked for an event, or a game is cancelled for weather, and the schedule is reworked again. Teams end up with three games one week and none the next, or always in the 10 pm slot, and standings are updated by hand.

Fixture generates a fair season schedule from teams, venues and time slots while respecting blackout dates, reschedules only the affected games when something is cancelled, and computes standings and playoff seeding.

## Users

| Role | Does |
|---|---|
| Coordinator (rec staff) | Sets up leagues, divisions, venues and time slots; generates, edits and publishes schedules |
| Captain | Manages the roster, submits blackout dates, reports scores |
| Player | Sees the team's schedule, RSVPs for games |
| Anyone | Views published schedules and standings without signing in |

## User stories

| # | Story | Acceptance criteria |
|---|---|---|
| 1 | As a coordinator, I want to create a league with divisions, venues and available time slots, so the schedule is built from what the facility actually has | A league has a name and time zone; divisions and venues belong to one league; a time slot belongs to one venue, ends after it starts, and can't overlap another slot at the same venue |
| 2 | As a captain, I want to submit dates my team can't play before the season is generated, so we aren't scheduled during exams | Blackout dates belong to one team; the generator never places that team on those dates (B1) |
| 3 | As a coordinator, I want to generate a fair round-robin season automatically | Every pair in a division meets once (S1); no team plays on consecutive days (F1); late games are spread evenly (F2) |
| 4 | As a coordinator, I want to cancel a game or close a venue for a day and get suggested new times for only the affected games | Unaffected games keep their slots; nothing is published until the coordinator approves |
| 5 | As a captain, I want to report the final score and have the other captain confirm it | A score counts in standings only after both captains agree |
| 6 | As a player, I want to see my team's upcoming games and RSVP | The captain sees how many players are in for each game |
| 7 | As anyone, I want standings with tiebreakers and a playoff bracket seeded from them | Ranking and tiebreakers follow S2 |
| 8 | As a coordinator, I want to type a change in plain English ("west gym closed next Thursday") and get a proposed reschedule to review | The text becomes a structured change the coordinator confirms before anything moves |

## Out of scope

Payments and registration fees, referee assignment, multi-campus leagues, native mobile apps.
