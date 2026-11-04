import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const packageJson = JSON.parse(
	readFileSync(new URL("../packages/cli/package.json", import.meta.url), "utf8")
);
const rev =
	packageJson.devDependencies["@cloudflare/forge"].match(
		/@([0-9a-f]{40})$/
	)?.[1];
if (!rev) {
	throw new Error("Expected a commit-pinned Forge preview");
}
const manifest = new URL("../packages/generator/Cargo.toml", import.meta.url);
const source = readFileSync(manifest, "utf8");
const updated = source.replace(
	/(forge = \{[^\n]*rev = ")[0-9a-f]{40}("[^\n]*\})/,
	`$1${rev}$2`
);
if (updated === source && !source.includes(`rev = "${rev}"`)) {
	throw new Error("Cannot find the native Forge dependency");
}
writeFileSync(manifest, updated);
execFileSync(
	"cargo",
	["update", "--manifest-path", "packages/generator/Cargo.toml", "-p", "forge"],
	{ cwd: new URL("..", import.meta.url), stdio: "inherit" }
);
