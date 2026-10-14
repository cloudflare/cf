import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const GENERATED_DIR = "packages/cli/src/commands/_generated";

const dataFile = process.env.RENOVATE_POST_UPGRADE_COMMAND_DATA_FILE;
if (!dataFile) {
	throw new Error("Renovate upgrade data file is not available");
}

const upgrades = JSON.parse(readFileSync(dataFile, "utf8"));
const [upgrade, ...rest] = Array.isArray(upgrades) ? upgrades : [];
if (
	upgrade?.depName !== "@cloudflare/forge" ||
	typeof upgrade.newDigest !== "string" ||
	!/^[0-9a-f]{40}$/.test(upgrade.newDigest) ||
	rest.length > 0
) {
	throw new Error("Renovate upgrade data is invalid");
}

// A Forge build that leaves the generated commands unchanged is internal.
const generatedChanged =
	execFileSync("git", ["status", "--porcelain", "--", GENERATED_DIR], {
		encoding: "utf8",
	}).trim() !== "";
if (!generatedChanged) {
	process.exit(0);
}

const sha = upgrade.newDigest;
writeFileSync(
	`.changeset/renovate-forge-${sha.slice(0, 12)}.md`,
	`---
"cf": patch
---

Update the generated command surface for \`@cloudflare/forge\` build
\`${sha}\`.
`
);
