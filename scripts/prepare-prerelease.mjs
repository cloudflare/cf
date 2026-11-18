import { existsSync, readFileSync, writeFileSync } from "node:fs";

const preStatePath = ".changeset/pre.json";
if (!existsSync(preStatePath)) {
	process.exit(0);
}

const preState = JSON.parse(readFileSync(preStatePath, "utf8"));
if (preState.mode !== "pre") {
	process.exit(0);
}

const packagePath = "packages/cli/package.json";
const packageJson = JSON.parse(readFileSync(packagePath, "utf8"));
const separator = packageJson.version.indexOf("-");
if (separator === -1) {
	process.exit(0);
}

const prerelease = packageJson.version.slice(separator + 1).split("+")[0];
if (prerelease.replace(/\.\d+$/, "") === preState.tag) {
	process.exit(0);
}

// Changesets increments the numeric suffix even when the channel changes.
// An unnumbered prerelease makes its next version start at zero.
packageJson.version = `${packageJson.version.slice(0, separator)}-${preState.tag}`;
writeFileSync(packagePath, `${JSON.stringify(packageJson, null, "\t")}\n`);
