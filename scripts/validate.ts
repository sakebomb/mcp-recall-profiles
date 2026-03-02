/**
 * Validates all profiles in profiles/ against the mcp-recall profile schema.
 * Exits 1 if any profile fails validation.
 */
import { parse } from "smol-toml";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

const VALID_STRATEGIES = ["json_extract", "json_truncate", "text_truncate"] as const;
const ID_RE = /^[a-z0-9_-]+$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;

interface ValidationError {
  file: string;
  errors: string[];
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
  return results;
}

function validateProfile(file: string): string[] {
  const errors: string[] = [];
  let parsed: unknown;

  try {
    parsed = parse(readFileSync(file, "utf8"));
  } catch (e) {
    return [`TOML parse error: ${e instanceof Error ? e.message : String(e)}`];
  }

  const p = parsed as Record<string, unknown>;
  const profile = p["profile"] as Record<string, unknown> | undefined;
  const strategy = p["strategy"] as Record<string, unknown> | undefined;

  // Required top-level sections
  if (!profile) { errors.push("missing [profile] section"); return errors; }
  if (!strategy) { errors.push("missing [strategy] section"); return errors; }

  // profile.id
  if (typeof profile["id"] !== "string" || !profile["id"]) {
    errors.push("profile.id is required and must be a non-empty string");
  } else if (!ID_RE.test(profile["id"])) {
    errors.push(`profile.id "${profile["id"]}" must match [a-z0-9_-]+`);
  }

  // profile.version
  if (typeof profile["version"] !== "string" || !profile["version"]) {
    errors.push("profile.version is required");
  } else if (!SEMVER_RE.test(profile["version"])) {
    errors.push(`profile.version "${profile["version"]}" must be semver (e.g. 1.0.0)`);
  }

  // profile.description
  if (typeof profile["description"] !== "string" || !profile["description"]) {
    errors.push("profile.description is required");
  }

  // profile.mcp_pattern
  if (typeof profile["mcp_pattern"] !== "string" && !Array.isArray(profile["mcp_pattern"])) {
    errors.push("profile.mcp_pattern is required (string or array of strings)");
  } else {
    const patterns = Array.isArray(profile["mcp_pattern"])
      ? profile["mcp_pattern"]
      : [profile["mcp_pattern"]];
    for (const pat of patterns) {
      if (typeof pat !== "string" || !pat) {
        errors.push("each mcp_pattern entry must be a non-empty string");
      }
    }
  }

  // strategy.type
  const stratType = strategy["type"];
  if (!stratType) {
    errors.push("strategy.type is required");
    return errors;
  }
  if (!VALID_STRATEGIES.includes(stratType as (typeof VALID_STRATEGIES)[number])) {
    errors.push(`strategy.type "${stratType}" must be one of: ${VALID_STRATEGIES.join(", ")}`);
    return errors;
  }

  // json_extract: fields required
  if (stratType === "json_extract") {
    const fields = strategy["fields"];
    if (!Array.isArray(fields) || fields.length === 0) {
      errors.push("json_extract strategy requires at least one entry in fields");
    }
  }

  // Numeric limits — all optional but must be positive integers if present
  const numericFields: Array<[Record<string, unknown>, string]> = [
    [strategy, "max_items"],
    [strategy, "max_chars_per_field"],
    [strategy, "max_depth"],
    [strategy, "max_array_items"],
    [strategy, "max_chars"],
    [strategy, "fallback_chars"],
  ];
  for (const [obj, key] of numericFields) {
    const val = obj[key];
    if (val !== undefined && (typeof val !== "number" || !Number.isInteger(val) || val <= 0)) {
      errors.push(`strategy.${key} must be a positive integer`);
    }
  }

  return errors;
}

const profilesDir = join(import.meta.dir, "..", "profiles");
const files = globProfiles(profilesDir);

if (files.length === 0) {
  console.log("No profiles found.");
  process.exit(0);
}

const failures: ValidationError[] = [];
for (const file of files) {
  const errors = validateProfile(file);
  if (errors.length > 0) {
    failures.push({ file: file.replace(profilesDir + "/", ""), errors });
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} profile(s) failed validation:\n`);
  for (const { file, errors } of failures) {
    console.error(`  ${file}`);
    for (const err of errors) console.error(`    • ${err}`);
  }
  process.exit(1);
}

console.log(`✓ ${files.length} profile(s) valid`);
