/**
 * Regenerates manifest.json from all valid profiles in profiles/.
 * Run automatically by CI on push to main.
 */
import { parse } from "smol-toml";
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join, relative } from "path";

const ROOT = join(import.meta.dir, "..");
const PROFILES_DIR = join(ROOT, "profiles");

interface ProfileEntry {
  id: string;
  version: string;
  description: string;
  mcp_pattern: string | string[];
  file: string;
  author?: string;
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
  let parsed: unknown;
  try {
    parsed = parse(readFileSync(file, "utf8"));
  } catch {
    console.warn(`Skipping ${file}: TOML parse error`);
    continue;
  }

  const p = parsed as Record<string, unknown>;
  const profile = p["profile"] as Record<string, unknown> | undefined;
  if (!profile || !profile["id"] || !profile["version"] || !profile["mcp_pattern"]) {
    console.warn(`Skipping ${file}: missing required profile fields`);
    continue;
  }

  entries.push({
    id: profile["id"] as string,
    version: profile["version"] as string,
    description: (profile["description"] as string) ?? "",
    mcp_pattern: profile["mcp_pattern"] as string | string[],
    file: relative(ROOT, file),
    ...(profile["author"] ? { author: profile["author"] as string } : {}),
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
