// Story 1: the coordinator's league setup page. Under Cache Components both `params` and the
// database read are runtime data, so they sit inside <Suspense>.
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionForm, Field } from "@/app/action-form";
import { toLocal } from "@/domain/local-time";
import { getLeagueSetup } from "@/server/leagues";
import { addDivisionAction, addTimeSlotAction, addVenueAction } from "./actions";

export default function LeagueSetupPage({ params }: PageProps<"/leagues/[leagueId]">) {
  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <Suspense fallback={<p>Loading league…</p>}>
        {params.then(({ leagueId }) => (
          <LeagueSetup leagueId={leagueId} />
        ))}
      </Suspense>
    </main>
  );
}

const input = "rounded border px-2 py-1";

async function LeagueSetup({ leagueId }: { leagueId: string }) {
  const league = await getLeagueSetup(leagueId);
  if (!league) notFound();

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold">{league.name}</h1>
        <p className="text-sm text-gray-500">Times are in {league.timeZone}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Divisions</h2>
        <ul className="list-disc pl-6">
          {league.divisions.map((division) => (
            <li key={division.id}>{division.name}</li>
          ))}
        </ul>
        <ActionForm action={addDivisionAction.bind(null, league.id)} label="Add division" submitText="Add division">
          <Field label="Division name">
            <input name="name" required className={input} />
          </Field>
        </ActionForm>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Venues and time slots</h2>
        {league.venues.map((venue) => (
          <div key={venue.id}>
            <h3 className="font-medium">{venue.name}</h3>
            <ul aria-label={`${venue.name} time slots`} className="list-disc pl-6 text-sm">
              {venue.timeSlots.map((slot) => {
                const start = toLocal(slot.startsAt, league.timeZone);
                const end = toLocal(slot.endsAt, league.timeZone);
                return (
                  <li key={slot.id}>
                    {start.date} {start.time}–{end.time}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <ActionForm action={addVenueAction.bind(null, league.id)} label="Add venue" submitText="Add venue">
          <Field label="Venue name">
            <input name="name" required className={input} />
          </Field>
        </ActionForm>
        {league.venues.length > 0 && (
          <ActionForm action={addTimeSlotAction.bind(null, league.id)} label="Add time slot" submitText="Add time slot">
            <Field label="Venue">
              <select name="venueId" required className={input}>
                {league.venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input type="date" name="date" required className={input} />
            </Field>
            <Field label="Start">
              <input type="time" name="start" defaultValue="19:00" required className={input} />
            </Field>
            <Field label="End">
              <input type="time" name="end" defaultValue="20:00" required className={input} />
            </Field>
          </ActionForm>
        )}
      </section>
    </>
  );
}
