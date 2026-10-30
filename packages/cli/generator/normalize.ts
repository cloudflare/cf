import { execFileSync } from "node:child_process";

/**
 * Normalizes compatibility metadata when the installed Forge supports it.
 *
 * Keep the fallback until cf's Forge pin contains both the normalize command
 * and the native-only parser. It lets this transition land before that pin.
 */
export function normalizeOpenApi(
	forgeBin: string,
	openapi: string
): string | undefined {
	const help = execFileSync(process.execPath, [forgeBin, "--help"], {
		encoding: "utf8",
	});
	if (!/^\s+normalize\b/m.test(help)) {
		return undefined;
	}
	return execFileSync(
		process.execPath,
		[forgeBin, "normalize", "-"],
		{ encoding: "utf8", input: openapi }
	);
}
