import { loadMeta } from "../lib/metadata.js";
import { theme } from "../lib/ui/theme.js";

interface SchemaIndex {
	schemas: Record<string, unknown>;
}

function isSchemaIndex(value: unknown): value is SchemaIndex {
	return (
		value !== null &&
		typeof value === "object" &&
		"schemas" in value &&
		typeof value.schemas === "object" &&
		value.schemas !== null &&
		!Array.isArray(value.schemas)
	);
}

export function appendApiSchemaHelp(
	help: string,
	command: string | undefined
): string {
	if (!command) {
		return help;
	}
	const metadata = loadMeta(import.meta.url, "schemas.json", isSchemaIndex);
	if (!metadata || !Object.hasOwn(metadata.schemas, command)) {
		return help;
	}
	const hint = theme.italic(
		`To inspect the exact API request, run ${theme.code(`cf schema ${command}`)}`
	);
	return `${help}\n\n${hint}`;
}
