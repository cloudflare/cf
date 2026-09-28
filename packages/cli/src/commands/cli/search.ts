import MiniSearch from "minisearch";
import { CliExit } from "../../lib/cli-exit.js";
import { isCommandsMetadata, loadMeta } from "../../lib/metadata.js";
import { formatOutput } from "../../lib/output.js";
import { runWithTelemetry } from "../../lib/telemetry/run.js";
import type { CommandMeta, CommandsMetadata } from "../../lib/metadata.js";
import type { CommandModule } from "yargs";

interface SearchDocument {
	command: string;
	summary: string;
	description: string;
	context: string;
}

interface SearchArgs {
	query: string;
}

function toSearchDocument(
	command: CommandMeta,
	descriptions: Record<string, string>
): SearchDocument {
	const parents = command.fullPath
		.slice(0, -1)
		.map((_, index) => command.fullPath.slice(0, index + 1).join(" "));
	return {
		command: command.command,
		summary: command.summary || command.description.split("\n")[0] || "",
		description: command.description,
		context: [
			...parents.map((path) => descriptions[path] ?? ""),
			...command.arguments.map((arg) => `${arg.name} ${arg.description}`),
			...command.options.map(
				(option) => `${option.name} ${option.description}`
			),
		].join(" "),
	};
}

export function searchCommands(
	metadata: CommandsMetadata,
	query: string
): Pick<SearchDocument, "command" | "summary">[] {
	const documents = metadata.commands.map((command) =>
		toSearchDocument(command, metadata.descriptions ?? {})
	);
	const index = new MiniSearch<SearchDocument>({
		fields: ["command", "summary", "description", "context"],
		storeFields: ["command", "summary"],
		idField: "command",
	});
	index.addAll(documents);
	return index
		.search(query, {
			prefix: true,
			fuzzy: 0.2,
			boost: { command: 8, summary: 5, description: 2, context: 0.5 },
		})
		.slice(0, 5)
		.map(({ command, summary }) => ({ command, summary }));
}

const search: CommandModule<object, SearchArgs> & { describe: string } = {
	command: "search <query>",
	describe: "Search all CLI commands by intent",
	builder: (yargs) =>
		yargs.positional("query", {
			describe: "Search terms or a description of what you want to do",
			type: "string",
			demandOption: true,
		}),
	handler: (argv) =>
		runWithTelemetry(
			{ command: "cli search", recordArgs: false, searchQuery: argv.query },
			argv as Record<string, unknown>,
			() => {
				const metadata = loadMeta(
					import.meta.url,
					"commands.json",
					isCommandsMetadata
				);
				if (!metadata) {
					console.error("Error: Could not load commands.json.");
					throw new CliExit(1);
				}
				formatOutput(searchCommands(metadata, argv.query));
			}
		),
};

export default search;
