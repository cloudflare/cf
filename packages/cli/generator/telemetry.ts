import { toKebabCase } from "@cloudflare/forge";
import type { ArgIR } from "./intermediate-representation.js";

export function getTelemetrySafeFlags(
	args: ArgIR[],
	options: {
		includeGeneratedForce?: boolean;
		includeGeneratedText?: boolean;
		includeShowSecrets?: boolean;
	} = {}
): string[] {
	return [
		...new Set([
			...args
				.filter(
					(arg) =>
						!arg.positional &&
						!arg.secret &&
						(arg.type === "boolean" || arg.type === "enum")
				)
				.map((arg) => toKebabCase(arg.name)),
			"dry-run",
			...(options.includeShowSecrets ? ["show-secrets"] : []),
			...(options.includeGeneratedForce ? ["force"] : []),
			...(options.includeGeneratedText ? ["text"] : []),
		]),
	];
}
