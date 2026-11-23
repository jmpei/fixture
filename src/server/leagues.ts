// League setup (story 1): leagues, divisions, venues and time slots. Auth will add the
// coordinator check; until then callers pass the league they act on.
import { z } from "zod";
import { prisma } from "./db";

/** A problem with the coordinator's input; its message is safe to show in the UI. */
export class LeagueInputError extends Error {}

const name = z.string().trim().min(1, "Enter a name");

function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new LeagueInputError(result.error.issues[0].message);
  return result.data;
}

export async function createLeague(input: { name: string }) {
  const data = parse(z.object({ name }), input);
  return prisma.league.create({ data });
}

export async function addDivision(input: { leagueId: string; name: string }) {
  const data = parse(z.object({ leagueId: z.string().min(1), name }), input);
  return prisma.division.create({ data });
}

export async function addVenue(input: { leagueId: string; name: string }) {
  const data = parse(z.object({ leagueId: z.string().min(1), name }), input);
  return prisma.venue.create({ data });
}

const timeSlotInput = z
  .object({ leagueId: z.string().min(1), venueId: z.string().min(1), startsAt: z.date(), endsAt: z.date() })
  .refine((s) => s.endsAt > s.startsAt, { message: "A time slot must end after it starts" });

export async function addTimeSlot(input: z.input<typeof timeSlotInput>) {
  const { leagueId, venueId, startsAt, endsAt } = parse(timeSlotInput, input);
  // Serializable so two coordinators adding overlapping slots at once can't both succeed.
  return prisma.$transaction(
    async (tx) => {
      const venue = await tx.venue.findFirst({ where: { id: venueId, leagueId } });
      if (!venue) throw new LeagueInputError("That venue isn't in this league");
      const clash = await tx.timeSlot.findFirst({
        where: { venueId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
      });
      if (clash) throw new LeagueInputError(`That time overlaps another slot at ${venue.name}`);
      return tx.timeSlot.create({ data: { venueId, startsAt, endsAt } });
    },
    { isolationLevel: "Serializable" },
  );
}

/** A league with its divisions, venues and each venue's slots in time order; null if missing. */
export async function getLeagueSetup(leagueId: string) {
  return prisma.league.findUnique({
    where: { id: leagueId },
    include: {
      divisions: { orderBy: { createdAt: "asc" } },
      venues: { orderBy: { createdAt: "asc" }, include: { timeSlots: { orderBy: { startsAt: "asc" } } } },
    },
  });
}

export async function getLeague(leagueId: string) {
  return prisma.league.findUnique({ where: { id: leagueId } });
}
