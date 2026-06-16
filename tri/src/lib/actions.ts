"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { createSession, destroySession, getCurrentUser } from "./session";
import { normalizeUsername, parseInstagramFollowing } from "./instagram";

export interface FormState {
  error?: string;
}

const HANDLE_RE = /^[a-z0-9._]{1,30}$/;

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function signupAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  const displayName = str(formData, "displayName");
  const igUsername = normalizeUsername(str(formData, "igUsername"));
  const password = str(formData, "password");
  const bio = str(formData, "bio") || null;
  const avatarUrl = str(formData, "avatarUrl") || null;

  if (!email || !email.includes("@")) return { error: "Enter a valid email." };
  if (!displayName) return { error: "Enter your name." };
  if (!HANDLE_RE.test(igUsername))
    return {
      error:
        "Enter a valid Instagram handle (letters, numbers, periods and underscores).",
    };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { igUsername }] },
  });
  if (existing) {
    return existing.email === email
      ? { error: "An account with that email already exists." }
      : { error: `The handle @${igUsername} is already claimed on Tri.` };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, displayName, igUsername, passwordHash, bio, avatarUrl },
  });

  await createSession(user.id);
  redirect("/tree");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const email = str(formData, "email").toLowerCase();
  const password = str(formData, "password");

  if (!email || !password) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }

  await createSession(user.id);
  redirect("/tree");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function importFollowingAction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let jsonText = str(formData, "jsonText");

  const file = formData.get("file");
  if (!jsonText && file && typeof file === "object" && "text" in file) {
    try {
      jsonText = await (file as File).text();
    } catch {
      return { error: "Could not read that file. Try again." };
    }
  }

  if (!jsonText) {
    return {
      error: "Upload your following.json file or paste its contents.",
    };
  }

  let parsed;
  try {
    parsed = parseInstagramFollowing(jsonText);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not parse file." };
  }

  // Don't let a user "follow" themselves into the tree.
  const rows = parsed
    .filter((f) => f.username !== user.id && f.username !== user.igUsername)
    .map((f) => ({
      ownerId: user.id,
      targetUsername: f.username,
      targetHref: f.href ?? null,
      followedAt: f.followedAt ?? null,
    }));

  // Replace the previous import wholesale so re-uploading stays idempotent.
  await prisma.$transaction([
    prisma.follow.deleteMany({ where: { ownerId: user.id } }),
    prisma.follow.createMany({ data: rows }),
  ]);

  revalidatePath("/tree");
  redirect("/tree");
}
