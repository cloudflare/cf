import { execFileSync } from "node:child_process";

/**
 * Normalizes compatibility metadata when the installed Forge supports it.
 *
 * Keep the fallback until cf's Forge pin contains both the normalize command
 * and the native-only parser. It lets this transition land before that pin.
 */
export function normalizeOpenApi(
	forgeBin: string,
	openapiPath: string
): boolean {
	const help = execFileSync(process.execPath, [forgeBin, "--help"], {
		encoding: "utf8",
	});
	if (!/^\s+normalize\b/m.test(help)) {
		return false;
	}
	execFileSync(
		process.execPath,
		[forgeBin, "normalize", "--write", openapiPath],
		{ stdio: "inherit" }
	);
	return true;
}
