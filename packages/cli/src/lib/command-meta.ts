/**
 * The shape of command metadata: what the generated `_meta/*.json` lists,
 * and what each hand-written command's `meta.ts` sidecar declares.
 *
 * This module imports nothing, so the generator plugin, which runs without
 * Node, can type its sidecars with it.
 */

/** Metadata for a positional argument of a command. */
export interface ArgumentMeta {
	/** Argument name */
	name: string;
	/** Zero-based position in the command */
	position: number;
	/** Data type */
	type: "string" | "number" | "boolean";
	/** Whether the argument is required */
	required: boolean;
	/** Human-readable description */
	description: string;
	/** Allowed values for enumerated types */
	enum?: string[];
	/** Dynamic completion source for this argument */
	completion?: { type: "dynamic"; operation: string; displayField: string };
}

/** Metadata for an option (flag) of a command. */
export interface OptionMeta {
	/** Option name (without dashes) */
	name: string;
	/** Data type */
	type: "string" | "number" | "boolean";
	/** Whether the option is required */
	required: boolean;
	/** Default value if not provided */
	default?: unknown;
	/** Human-readable description */
	description: string;
	/** Allowed values for enumerated types */
	enum?: string[];
	/** CLI aliases accepted by yargs */
	alias?: string | string[];
}

/** An example of a command. */
export interface ExampleMeta {
	/** Brief description of what the example demonstrates */
	description: string;
	/** The full command to run */
	command: string;
}

/** Metadata for a command, as the generated `commands.json` lists it. */
export interface CommandMeta {
	/** Full command string (e.g., "cf dns records create") */
	command: string;
	/** Command name (e.g., "create") */
	name: string;
	/** Path segments (e.g., ["dns", "records", "create"]) */
	fullPath: string[];
	/** Human-readable description */
	description: string;
	/** Short summary used in listings */
	summary?: string;
	/** Usage string showing syntax */
	usage: string;
	/** Positional arguments */
	arguments: ArgumentMeta[];
	/** Command-specific options */
	options: OptionMeta[];
	/** Method category (read, create, update, delete, action) */
	category?: "read" | "create" | "update" | "delete" | "action";
	/** HTTP method (GET, POST, PUT, PATCH, DELETE) */
	httpMethod?: string;
	/** API path template (e.g., /zones/{zone_id}/dns_records) */
	apiPath?: string;
	/** OpenAPI operation ID */
	operationId?: string;
	/** Whether the operation accepts a request body */
	hasRequestBody?: boolean;
	/** Whether this command is hidden by default */
	hideCommand?: boolean;
	/** Alternative names of the command */
	aliases?: string[];
}

/**
 * The sidecar of a hand-written leaf added to the generated tree: its
 * complete metadata.
 */
export type LeafCommandMeta = CommandMeta &
	Required<Pick<CommandMeta, "category">>;

/**
 * The sidecar of a hand-written leaf that overrides a generated one: what it
 * replaces of the metadata derived from the operation.
 */
export type LeafOverrideMeta = Pick<
	CommandMeta,
	"description" | "usage" | "arguments" | "options"
>;

/**
 * Metadata structure from the generated `commands.json` file.
 */
export interface CommandsMetadata {
	version: string;
	generatedAt: string;
	commands: CommandMeta[];
	/** Descriptions for command groups (product and method group levels) */
	descriptions?: Record<string, string>;
}
