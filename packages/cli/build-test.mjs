import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Keep mockable dependencies external for the compiled Wrangler test suite.
// Resolve the local Vite+ binary without a shell so this works on every OS.
const vitePlusDir = dirname(
	fileURLToPath(import.meta.resolve("vite-plus/package.json"))
);
const result = spawnSync(
	process.execPath,
	[join(vitePlusDir, "bin", "vp"), "pack"],
	{
		env: { ...process.env, CF_TEST_BUNDLE: "1" },
		stdio: "inherit",
	}
);

if (result.error) {
	throw result.error;
}
process.exit(result.status ?? 1);
