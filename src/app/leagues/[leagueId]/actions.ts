"use server";
// Server Actions are reachable by direct POST, so input is validated again in src/server/.
// Each action is bound to its league id by the setup page.
import { refresh } from "next/cache";
import type { FormState } from "@/app/action-form";
import { localDateTime } from "@/domain/local-time";
import { addDivision, addTimeSlot, addVenue, getLeague, LeagueInputError } from "@/server/leagues";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

async function save(prev: FormState, work: () => Promise<unknown>): Promise<FormState> {
  try {
    await work();
  } catch (error) {
    if (error instanceof LeagueInputError) return { error: error.message, saved: prev.saved };
    if (error instanceof Error && error.message.startsWith("Invalid local date")) {
      return { error: "Enter a valid date and times", saved: prev.saved };
    }
    throw error;
  }
  refresh();
  return { saved: (prev.saved ?? 0) + 1 };
}

export async function addDivisionAction(leagueId: string, prev: FormState, form: FormData) {
  return save(prev, () => addDivision({ leagueId, name: field(form, "name") }));
}

export async function addVenueAction(leagueId: string, prev: FormState, form: FormData) {
  return save(prev, () => addVenue({ leagueId, name: field(form, "name") }));
}

export async function addTimeSlotAction(leagueId: string, prev: FormState, form: FormData) {
  return save(prev, async () => {
    const league = await getLeague(leagueId);
    if (!league) throw new LeagueInputError("That league doesn't exist");
    const date = field(form, "date");
    await addTimeSlot({
      leagueId,
      venueId: field(form, "venueId"),
      startsAt: localDateTime(date, field(form, "start"), league.timeZone),
      endsAt: localDateTime(date, field(form, "end"), league.timeZone),
    });
  });
}
