import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/AuthForm";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/tree");

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="text-3xl font-bold">Create your Tri profile</h1>
      <p className="mt-2 text-muted">
        Claim your handle so the friends you follow can find you here.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
