import { CliExit } from "../lib/cli-exit.js";
/**
 * `cf schema` command
 *
 * Outputs API schema details for agent introspection.
 * Always outputs JSON (this command is for agents).
 */
import { loadMeta } from "../lib/metadata.js";
import { formatOutput } from "../lib/output.js";
import type { CommandModule } from "yargs";

interface SchemaInfo {
	operationId: string;
	httpMethod: string;
	path: string;
	pathParams: { name: string; type: string; required: boolean }[];
	queryParams: { name: string; type: string; required: boolean }[];
	hasRequestBody: boolean;
	requestBodyFields: {
		name: string;
		type: string;
		required: boolean;
		description: string;
	}[];
}

interface SchemaFile {
	version: string;
	generatedAt: string;
	schemas: Record<string, SchemaInfo>;
}

function isSchemaFile(value: unknown): value is SchemaFile {
	return (
		value !== null &&
		typeof value === "object" &&
		"version" in value &&
		"schemas" in value &&
		typeof (value as Record<string, unknown>).version === "string" &&
		typeof (value as Record<string, unknown>).schemas === "object"
	);
}

interface SchemaArgs {
	command: string[];
	list: boolean;
}

const schema: CommandModule<object, SchemaArgs> & { describe: string } = {
	command: "schema [command..]",
	describe: "Show API schema details for a command",
	builder: (yargs) =>
		yargs
			.positional("command", {
				describe: "Command path segments (e.g., dns records create)",
				type: "string",
				array: true,
				default: [] as string[],
			})
			.option("list", {
				type: "boolean",
				describe: "List all available schemas",
				default: false,
			}),
	handler: async (argv) => {
		const schemas = loadMeta(import.meta.url, "schemas.json", isSchemaFile);
		if (!schemas) {
			console.error(
				"Error: Could not load schemas.json. Run `pnpm generate` first."
			);
			throw new CliExit(1);
		}

		if (argv.list) {
			// List all schemas with summary info
			const summary = Object.entries(schemas.schemas).map(
				([command, info]) => ({
					command: `cf ${command}`,
					httpMethod: info.httpMethod,
					apiPath: info.path,
					operationId: info.operationId,
				})
			);
			formatOutput(summary);
			return;
		}

		if (argv.command.length === 0) {
			console.error("Usage: cf schema <command...>  or  cf schema --list");
			console.error("Example: cf schema dns records create");
			throw new CliExit(1);
		}

		const commandPath = argv.command.join(" ");
		const info = schemas.schemas[commandPath];

		if (!info) {
			// Try to find close matches
			const allPaths = Object.keys(schemas.schemas);
			const matches = allPaths.filter(
				(p) => p.includes(commandPath) || commandPath.includes(p)
			);

			if (matches.length > 0) {
				console.error(`Schema not found for "${commandPath}". Did you mean:`);
				for (const m of matches) {
					console.error(`  cf schema ${m}`);
				}
			} else {
				console.error(
					`Schema not found for "${commandPath}". Use --list to see available schemas.`
				);
			}
			throw new CliExit(1);
		}

		formatOutput(info);
	},
};

export default schema;
