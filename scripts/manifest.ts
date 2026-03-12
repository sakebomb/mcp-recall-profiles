/**
 * Regenerates manifest.json from all valid profiles in profiles/.
 * Run automatically by CI on push to main.
 */
import { parse } from "smol-toml";
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { createHash } from "crypto";

const ROOT = join(import.meta.dir, "..");
const PROFILES_DIR = join(ROOT, "profiles");

interface ProfileEntry {
  id: string;
  short_name: string;
  version: string;
  description: string;
  mcp_pattern: string | string[];
  file: string;
  sha256: string;
  author?: string;
  mcp_url?: string;
  sample_tool?: string;
}

function globProfiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...globProfiles(full));
    } else if (entry.endsWith(".toml")) {
      results.push(full);
    }
  }
  return results.sort();
}

const files = globProfiles(PROFILES_DIR);
const entries: ProfileEntry[] = [];

for (const file of files) {
  let content: string;
  let parsed: unknown;
  try {
    content = readFileSync(file, "utf8");
    parsed = parse(content);
  } catch {
    console.warn(`Skipping ${file}: TOML parse error`);
    continue;
  }
  const sha256 = createHash("sha256").update(content).digest("hex");

  const p = parsed as Record<string, unknown>;
  const profile = p["profile"] as Record<string, unknown> | undefined;
  if (!profile || !profile["id"] || !profile["version"] || !profile["mcp_pattern"]) {
    console.warn(`Skipping ${file}: missing required profile fields`);
    continue;
  }

  const id = profile["id"] as string;
  const shortName = (profile["short_name"] as string | undefined) ?? id.replace(/^mcp__/, "");
  entries.push({
    id,
    short_name: shortName,
    version: profile["version"] as string,
    description: (profile["description"] as string) ?? "",
    mcp_pattern: profile["mcp_pattern"] as string | string[],
    file: relative(ROOT, file),
    sha256,
    ...(profile["author"] ? { author: profile["author"] as string } : {}),
    ...(profile["mcp_url"] ? { mcp_url: profile["mcp_url"] as string } : {}),
    ...(profile["sample_tool"] ? { sample_tool: profile["sample_tool"] as string } : {}),
  });
}

const manifest = {
  schema_version: "1",
  generated_at: new Date().toISOString(),
  profiles: entries,
};

writeFileSync(join(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`✓ manifest.json — ${entries.length} profile(s)`);
