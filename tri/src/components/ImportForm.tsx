"use client";

import { useActionState, useRef, useState } from "react";
import { importFollowingAction, type FormState } from "@/lib/actions";

const initial: FormState = {};

export function ImportForm() {
  const [state, action, pending] = useActionState(
    importFollowingAction,
    initial
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="space-y-5">
      <label
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-2 px-6 py-10 text-center transition hover:border-brand"
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-4xl">🌳</div>
        <p className="mt-3 font-semibold">
          {fileName ?? "Choose your following.json"}
        </p>
        <p className="mt-1 text-sm text-muted">
          The JSON file from your Instagram data export
        </p>
        <input
          ref={fileRef}
          name="file"
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
      </label>

      <button
        type="button"
        onClick={() => setShowPaste((s) => !s)}
        className="text-sm text-brand hover:underline"
      >
        {showPaste ? "Hide paste box" : "…or paste the JSON instead"}
      </button>

      {showPaste && (
        <textarea
          name="jsonText"
          rows={6}
          placeholder='{ "relationships_following": [ … ] }'
          className="w-full rounded-xl border border-border bg-surface-2 px-4 py-3 font-mono text-xs text-foreground outline-none focus:border-brand"
        />
      )}

      {state.error && (
        <p className="rounded-lg border border-brand-2/40 bg-brand-2/10 px-3 py-2 text-sm text-brand-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-gradient-to-r from-brand to-brand-2 px-4 py-2.5 font-semibold text-background transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Planting your tree…" : "Build my tree"}
      </button>
    </form>
  );
}
