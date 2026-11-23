"use client";
// A form for a Server Action that returns FormState. It submits from onSubmit instead of
// <form action>: React 19 resets a form after an action passed to `action` finishes, which
// would wipe a rejected entry. After a successful save the `saved` count changes the key,
// so the form remounts empty.
import { startTransition, useActionState, type ReactNode } from "react";

export type FormState = { error?: string; saved?: number };

type Props = {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  label: string;
  submitText: string;
  children: ReactNode;
};

export function ActionForm({ action, label, submitText, children }: Props) {
  const [state, dispatch, pending] = useActionState(action, {});
  return (
    <form
      key={state.saved ?? 0}
      aria-label={label}
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => dispatch(data));
      }}
      className="flex flex-wrap items-end gap-3"
    >
      {children}
      <button
        disabled={pending}
        className="rounded bg-black px-3 py-1.5 text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {submitText}
      </button>
      <p role="status" className="w-full text-sm text-red-600">
        {state.error}
      </p>
    </form>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col text-sm">
      {label}
      {children}
    </label>
  );
}
