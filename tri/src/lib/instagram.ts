// Parser for the Instagram "Download Your Information" export.
//
// We never touch Instagram's servers. The user requests their own data from
// Instagram (Settings -> Accounts Center -> Your information and permissions ->
// Download your information), receives a file, and uploads the relevant JSON to
// Tri. This keeps Tri fully within Instagram's Terms.
//
// Instagram has shipped a few shapes of this file over the years. We accept the
// common ones:
//   - following.json with a `relationships_following` array
//   - connections.json containing the same array
//   - a bare array of entries
// Each entry typically looks like:
//   { "string_list_data": [ { "href": "...", "value": "username", "timestamp": 0 } ] }

export interface ParsedFollow {
  username: string;
  href?: string;
  followedAt?: Date;
}

export function normalizeUsername(raw: string): string {
  return String(raw)
    .trim()
    .replace(/^@+/, "")
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/[/?#].*$/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
}

function fromItem(item: unknown): ParsedFollow | null {
  if (!item || typeof item !== "object") return null;
  const rec = item as Record<string, unknown>;

  const rawValue =
    (rec.value as string | undefined) ??
    (rec.username as string | undefined) ??
    "";
  const href = (rec.href as string | undefined) ?? undefined;

  let username = "";
  if (rawValue) {
    username = normalizeUsername(rawValue);
  } else if (href) {
    username = normalizeUsername(href);
  }
  if (!username) return null;

  const ts = rec.timestamp;
  const followedAt =
    typeof ts === "number" && ts > 0 ? new Date(ts * 1000) : undefined;

  return { username, href, followedAt };
}

export function parseInstagramFollowing(jsonText: string): ParsedFollow[] {
  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error(
      "That doesn't look like valid JSON. Upload the following.json (or connections.json) file from your Instagram data export."
    );
  }

  const out: ParsedFollow[] = [];
  const seen = new Set<string>();
  const push = (f: ParsedFollow | null) => {
    if (f && !seen.has(f.username)) {
      seen.add(f.username);
      out.push(f);
    }
  };

  const candidateArrays: unknown[] = [];
  if (Array.isArray(data)) {
    candidateArrays.push(data);
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // The export key we care about, plus a couple of close cousins.
    for (const key of [
      "relationships_following",
      "following",
      "relationships_follow_requests_sent",
    ]) {
      if (Array.isArray(obj[key])) candidateArrays.push(obj[key]);
    }
  }

  for (const arr of candidateArrays) {
    if (!Array.isArray(arr)) continue;
    for (const entry of arr) {
      const sld = (entry as Record<string, unknown>)?.string_list_data;
      if (Array.isArray(sld) && sld.length > 0) {
        for (const item of sld) push(fromItem(item));
      } else {
        push(fromItem(entry));
      }
    }
  }

  if (out.length === 0) {
    throw new Error(
      "Couldn't find any accounts in that file. Make sure you uploaded the following.json (the list of accounts you follow) from your Instagram export, in JSON format."
    );
  }

  return out;
}
