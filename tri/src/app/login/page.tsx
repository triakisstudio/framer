import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "@/components/AuthForm";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/tree");

  return (
    <div className="mx-auto max-w-md px-5 py-14">
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted">Log in to see your tree.</p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
