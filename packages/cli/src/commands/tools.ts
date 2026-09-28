import { isCommandsMetadata, loadMeta } from "../lib/metadata.js";
import { formatOutput } from "../lib/output.js";
import type { ArgumentMeta, CommandMeta, OptionMeta } from "../lib/metadata.js";
import type { ArgumentsCamelCase, Argv, CommandModule } from "yargs";

/**
 * MCP Tool input schema property definition.
 */
interface MCPSchemaProperty {
	type: string;
	description: string;
	default?: unknown;
	enum?: string[];
}

/**
 * MCP Tool definition following the Model Context Protocol schema.
 */
interface MCPTool {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, MCPSchemaProperty>;
		required: string[];
	};
}

/**
 * MCP Tools output format.
 */
interface MCPToolsOutput {
	version: string;
	tools: MCPTool[];
}

/**
 * Convert a command string to MCP tool name format.
 * Replaces spaces and hyphens with underscores.
 *
 * @example
 * "cf dns records create" -> "cf_dns_records_create"
 * "cf d1 time-travel info" -> "cf_d1_time_travel_info"
 */
function toToolName(command: string): string {
	return command.replace(/[\s-]+/g, "_");
}

/**
 * Convert an ArgumentMeta or OptionMeta to an MCP schema property.
 */
function toSchemaProperty(meta: ArgumentMeta | OptionMeta): MCPSchemaProperty {
	const property: MCPSchemaProperty = {
		type: meta.type,
		description: meta.description,
	};

	// Add default value if present (only for options)
	if ("default" in meta && meta.default !== undefined) {
		property.default = meta.default;
	}

	// Add enum values if present
	if (meta.enum && meta.enum.length > 0) {
		property.enum = meta.enum;
	}

	return property;
}

/**
 * Convert a CommandMeta to an MCP Tool definition.
 */
function toMCPTool(command: CommandMeta): MCPTool {
	const properties: Record<string, MCPSchemaProperty> = {};
	const required: string[] = [];

	// Add arguments to properties
	for (const arg of command.arguments) {
		properties[arg.name] = toSchemaProperty(arg);
		if (arg.required) {
			required.push(arg.name);
		}
	}

	// Add options to properties
	for (const opt of command.options) {
		properties[opt.name] = toSchemaProperty(opt);
		if (opt.required) {
			required.push(opt.name);
		}
	}

	return {
		name: toToolName(command.command),
		description: command.description,
		inputSchema: {
			type: "object",
			properties,
			required,
		},
	};
}

// Empty args interface since tools command takes no arguments
type ToolsArgs = object;

const toolsCommand: CommandModule<object, ToolsArgs> = {
	command: "tools",
	// Hidden from regular help - describe: false makes it not show in help output
	describe: false,

	builder: (yargs: Argv): Argv<ToolsArgs> => {
		return yargs as Argv<ToolsArgs>;
	},

	handler: async (_argv: ArgumentsCamelCase<ToolsArgs>): Promise<void> => {
		const meta = loadMeta(import.meta.url, "commands.json", isCommandsMetadata);
		const commands = meta?.commands ?? null;

		if (commands === null) {
			// Warn to stderr about missing metadata file
			console.error(
				"Warning: Command metadata file not found. Run the build to generate it."
			);

			// Output empty tools array to stdout
			const output: MCPToolsOutput = {
				version: "1.0",
				tools: [],
			};
			formatOutput(output);
			return;
		}

		// Transform all commands to MCP tool format
		const tools = commands.map(toMCPTool);

		const output: MCPToolsOutput = {
			version: "1.0",
			tools,
		};

		// Output JSON to stdout
		formatOutput(output);
	},
};

export default toolsCommand;
