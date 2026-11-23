"use server";
// Server Actions are reachable by direct POST, so input is validated again in src/server/.
import { redirect } from "next/navigation";
import type { FormState } from "@/app/action-form";
import { createLeague, LeagueInputError } from "@/server/leagues";

export async function createLeagueAction(_prev: FormState, form: FormData): Promise<FormState> {
  let leagueId: string;
  try {
    leagueId = (await createLeague({ name: String(form.get("name") ?? "") })).id;
  } catch (error) {
    if (error instanceof LeagueInputError) return { error: error.message };
    throw error;
  }
  redirect(`/leagues/${leagueId}`);
}
