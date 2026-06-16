"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, loginAction, type FormState } from "@/lib/actions";

const initial: FormState = {};

const inputClass =
  "w-full rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-foreground placeholder:text-muted/60 outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const isSignup = mode === "signup";
  const [state, action, pending] = useActionState(
    isSignup ? signupAction : loginAction,
    initial
  );

  return (
    <form action={action} className="space-y-4">
      {isSignup && (
        <>
          <div>
            <label className="mb-1 block text-sm text-muted">Your name</label>
            <input name="displayName" className={inputClass} placeholder="Jane Doe" />
          </div>
          <div>
            <label className="mb-1 block text-sm text-muted">
              Instagram handle{" "}
              <span className="text-muted/60">(how friends find you)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-muted">@</span>
              <input
                name="igUsername"
                className={inputClass}
                placeholder="janedoe"
                autoCapitalize="none"
              />
            </div>
          </div>
        </>
      )}

      <div>
        <label className="mb-1 block text-sm text-muted">Email</label>
        <input
          name="email"
          type="email"
          className={inputClass}
          placeholder="you@example.com"
          autoCapitalize="none"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-muted">Password</label>
        <input
          name="password"
          type="password"
          className={inputClass}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
        />
      </div>

      {isSignup && (
        <div>
          <label className="mb-1 block text-sm text-muted">
            Avatar URL <span className="text-muted/60">(optional)</span>
          </label>
          <input
            name="avatarUrl"
            className={inputClass}
            placeholder="https://…/me.jpg"
          />
        </div>
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
        {pending
          ? "One moment…"
          : isSignup
            ? "Create my Tri profile"
            : "Log in"}
      </button>

      <p className="text-center text-sm text-muted">
        {isSignup ? (
          <>
            Already on Tri?{" "}
            <Link href="/login" className="text-brand hover:underline">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-brand hover:underline">
              Create a profile
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
