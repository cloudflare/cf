import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

const dataFile = process.env.RENOVATE_POST_UPGRADE_COMMAND_DATA_FILE;
if (!dataFile) {
	throw new Error("Renovate upgrade data file is not available");
}

const upgrades = JSON.parse(readFileSync(dataFile, "utf8"));
if (!Array.isArray(upgrades)) {
	throw new Error("Renovate upgrade data is invalid");
}

const details = new Set();

for (const upgrade of upgrades) {
	const { currentValue, depName, newValue } = upgrade;
	if (
		typeof currentValue !== "string" ||
		typeof depName !== "string" ||
		typeof newValue !== "string"
	) {
		throw new Error("Renovate upgrade data is invalid");
	}

	details.add(`- \`${depName}\`: \`${currentValue}\` → \`${newValue}\``);
}

if (details.size === 0) {
	throw new Error("Renovate upgrade data is empty");
}

const detailsText = [...details]
	.sort((left, right) => left.localeCompare(right))
	.join("\n");
const changeset = `---
"cf": patch
---

Update dependencies published from the Workers SDK repository:

${detailsText}
`;

const upgradeHash = createHash("sha256")
	.update(detailsText)
	.digest("hex")
	.slice(0, 12);

writeFileSync(`.changeset/renovate-workers-sdk-${upgradeHash}.md`, changeset);
