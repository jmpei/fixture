import { ActionForm, Field } from "@/app/action-form";
import { createLeagueAction } from "./actions";

export default function NewLeaguePage() {
  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">New league</h1>
      <ActionForm action={createLeagueAction} label="New league" submitText="Create league">
        <Field label="League name">
          <input name="name" required className="rounded border px-2 py-1" />
        </Field>
      </ActionForm>
    </main>
  );
}
