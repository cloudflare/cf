/**
 * CLI Metadata Generator
 *
 * Generates command metadata during the build process for the help system.
 * Converts Schema.method definitions to CommandMeta objects and generates
 * MCP tool definitions for AI agent usage.
 */

import assert from "assert";
import {
	BODY_OPTIONS,
	FILE_OPTIONS,
	getMethodCategory,
	MUTATING_OPTIONS,
	requireMethodDescription,
	resolveOperation,
	UNIVERSAL_OPTIONS,
} from "@cloudflare/forge";
import { isWorkerNameArg } from "./arg-classification.js";
import {
	applyOptionalParentDowngrade,
	deriveArgsFromOp,
} from "./arg-derivation.js";
import { getMethodSummary } from "./descriptions.js";
import {
	argScalarType,
	optionArgs,
	positionalArgs,
} from "./intermediate-representation.js";
import type { ArgIR } from "./intermediate-representation.js";
import type {
	ArgumentMeta,
	CommandMeta,
	OptionMeta,
	Schema,
} from "@cloudflare/forge";

/** Command metadata emitted by the generator, including the listing summary. */
export type GeneratedCommandMeta = CommandMeta & {
	summary?: string;
};

/** Default value for a metadata option, or `undefined` when none. */
function metaDefault(arg: ArgIR): unknown {
	return arg.default;
}

/**
 * Generate metadata for a single command
 *
 * @param method - The Schema.method to convert
 * @param resourceName - Top-level resource name (e.g., "d1", "dns")
 * @param groupName - Optional group name for nested commands (e.g., "records" for dns.records.create)
 * @returns CommandMeta object with complete command metadata
 */
export function generateCommandMeta(
	method: Schema.method,
	resourceName: string,
	groupName?: string,
	hideCommand?: boolean
): GeneratedCommandMeta {
	// Resolve OpenAPI operation info early — needed for arg derivation
	// and for later metadata fields (httpMethod, apiPath, etc.).
	const opInfo = resolveOperation(method.operationId);
	assert(
		opInfo,
		`Failed to resolve operation for method: ${method.operationId}`
	);

	// Same arg-derivation source of truth as generator.ts, so
	// `commands.json` matches the actual CLI surface (overlay overrides
	// and all).
	const derived = deriveArgsFromOp(method, resourceName, opInfo);
	applyOptionalParentDowngrade(derived);
	const positional = positionalArgs(derived.args);
	const options = optionArgs(derived.args);

	// Apply worker-name demotion of path params to options. This is one
	// affordance the metadata side keeps on top of `deriveArgsFromOp`:
	// the generator emits `--worker` via `isWorkerNameArg` in its
	// path-param loop only in autoDerive mode, but the wrangler-tests
	// pre-yargs allowlist needs it surfaced in `commands.json` for ALL
	// workers ops regardless of autoDerive. Re-running the check here
	// fills the gap; if the worker arg was already added by the
	// derivation, the existence check below dedupes.
	const isWorkersCommand = resourceName === "workers";
	if (isWorkersCommand && opInfo && opInfo.pathParams.length > 0) {
		for (const p of opInfo.pathParams) {
			const argName = p.name.replace(/_/g, "-");
			const maybeArg = { name: argName, type: "string" } as Schema.arg;
			if (!isWorkerNameArg(maybeArg)) continue;
			// Emit as `--worker` regardless of the OpenAPI param spelling.
			const emittedName = "worker";
			if (options.some((a) => a.name === emittedName)) continue;
			options.push({
				name: emittedName,
				type: "string",
				required: true,
				positional: false,
				origin: { kind: "path", wireName: p.name },
				description: p.description ?? `The ${p.name.replace(/_/g, " ")}`,
				isZone: false,
				isWorkerName: true,
			});
		}
	}

	// Build full path array: ["dns", "records", "create"] or ["d1", "list"]
	// groupName can be slash-separated for nested groups (e.g. "applications/cas")
	const fullPath: string[] = groupName
		? [resourceName, ...groupName.split("/"), method.name]
		: [resourceName, method.name];

	// Build command string: "cf dns records create" or "cf d1 list"
	const command = `cf ${fullPath.join(" ")}`;

	// Build usage string with positional args
	const positionalUsage = positional
		.map((a) => {
			const name = a.type === "array" ? `${a.name}...` : a.name;
			return a.required ? `<${name}>` : `[${name}]`;
		})
		.join(" ");

	const hasOptions = options.length > 0;
	const usage = positionalUsage
		? `${command} ${positionalUsage}${hasOptions ? " [options]" : ""}`
		: `${command}${hasOptions ? " [options]" : ""}`;

	// Convert positional args to ArgumentMeta
	const argumentMetas: ArgumentMeta[] = positional.map((arg, index) => {
		const meta: ArgumentMeta = {
			name: arg.name,
			position: index,
			type: argScalarType(arg),
			required: arg.required,
			description: arg.description,
		};

		if (arg.choices && arg.choices.length > 0) {
			meta.enum = arg.choices;
		}

		return meta;
	});

	// Convert options to OptionMeta — keep kebab-case names for CLI display
	const optionMetas: OptionMeta[] = options.map((arg) => {
		const meta: OptionMeta = {
			name: arg.name,
			type: argScalarType(arg),
			required: arg.required,
			description: arg.description,
		};

		const defaultValue = metaDefault(arg);
		if (defaultValue !== undefined) {
			meta.default = defaultValue;
		}

		if (arg.choices && arg.choices.length > 0) {
			meta.enum = arg.choices;
		}

		return meta;
	});

	// Only advertise universal options the yargs builder actually
	// registers; otherwise commands.json would list flags `yargs.strict()`
	// rejects at runtime (e.g. forge's reserved `--fields` / `--ndjson`).
	// The builder consumes none today — add a name here when one gets
	// wired into the builder + lib/output.ts. Op-level options still win.
	const BUILDER_REGISTERED_UNIVERSAL_OPTIONS = new Set<string>();
	const optionNamesSeen = new Set(optionMetas.map((o) => o.name));
	for (const opt of UNIVERSAL_OPTIONS) {
		if (!BUILDER_REGISTERED_UNIVERSAL_OPTIONS.has(opt.name)) continue;
		if (optionNamesSeen.has(opt.name)) continue;
		optionMetas.push({
			name: opt.name,
			type: opt.type as "string" | "number" | "boolean",
			required: false,
			description: opt.description,
			...("default" in opt ? { default: opt.default } : {}),
		});
	}

	// --dry-run lives in MUTATING_OPTIONS but the builder only ever
	// registers the literal "dry-run" (hardcoded), on EVERY command
	// (reads included). Guard to the builder-registered set so
	// commands.json can't advertise a flag yargs.strict() rejects if
	// MUTATING_OPTIONS grows upstream. Keep the kebab name (#6).
	const BUILDER_REGISTERED_MUTATING_OPTIONS = new Set(["dry-run"]);
	for (const opt of MUTATING_OPTIONS) {
		if (!BUILDER_REGISTERED_MUTATING_OPTIONS.has(opt.name)) continue;
		optionMetas.push({
			name: opt.name,
			type: opt.type as "string" | "number" | "boolean",
			required: false,
			description: opt.description,
			...("default" in opt ? { default: opt.default } : {}),
		});
	}

	// Add body options for ops that actually emit --body. Use the
	// shared `derived` view (real HTTP verb) rather than name-based
	// detection so read-shaped POSTs (query/search/raw) don't drift.
	if (derived.hasBody) {
		for (const opt of BODY_OPTIONS) {
			optionMetas.push({
				name: opt.name,
				type: opt.type as "string" | "number" | "boolean",
				required: false,
				description: opt.description,
			});
		}
	}

	// Add file options for ops with non-JSON content types.
	if (derived.hasFileUpload) {
		for (const opt of FILE_OPTIONS) {
			optionMetas.push({
				name: opt.name,
				type: opt.type as "string" | "number" | "boolean",
				required: false,
				description: opt.description,
			});
		}
	}

	const meta: GeneratedCommandMeta = {
		command,
		name: method.name,
		fullPath,
		description: requireMethodDescription(method),
		summary: getMethodSummary(method),
		usage,
		arguments: argumentMetas,
		options: optionMetas,
		category: getMethodCategory(method.name),
		hasRequestBody: opInfo?.hasRequestBody ?? false,
	};

	// Only set optional fields when they have values (exactOptionalPropertyTypes)
	if (opInfo) {
		meta.httpMethod = opInfo.method.toUpperCase();
		meta.apiPath = opInfo.path;
	}
	if (method.operationId) {
		meta.operationId = method.operationId;
	}
	if (hideCommand !== undefined) {
		meta.hideCommand = hideCommand;
	}

	return meta;
}

/**
 * MCP Tool input schema property definition
 */
interface ToolInputProperty {
	type: "string" | "number" | "boolean";
	description: string;
	enum?: string[];
	default?: unknown;
}

/**
 * MCP Tool definition format
 */
export interface ToolDefinition {
	name: string;
	description: string;
	inputSchema: {
		type: "object";
		properties: Record<string, ToolInputProperty>;
		required: string[];
	};
}

/**
 * Convert CommandMeta to MCP tool format
 *
 * @param meta - The CommandMeta to convert
 * @returns ToolDefinition in MCP format for AI agent usage
 */
export function generateToolDefinition(meta: CommandMeta): ToolDefinition {
	// Tool name format: cf_dns_records_create (underscores)
	const name = `cf_${meta.fullPath.join("_")}`;

	const properties: Record<string, ToolInputProperty> = {};
	const required: string[] = [];

	// Add arguments to properties
	for (const arg of meta.arguments) {
		const prop: ToolInputProperty = {
			type: arg.type,
			description: arg.description,
		};

		if (arg.enum) {
			prop.enum = arg.enum;
		}

		properties[arg.name] = prop;

		if (arg.required) {
			required.push(arg.name);
		}
	}

	// Add options to properties
	for (const opt of meta.options) {
		const prop: ToolInputProperty = {
			type: opt.type,
			description: opt.description,
		};

		if (opt.enum) {
			prop.enum = opt.enum;
		}

		if (opt.default !== undefined) {
			prop.default = opt.default;
		}

		properties[opt.name] = prop;

		if (opt.required) {
			required.push(opt.name);
		}
	}

	return {
		name,
		description: meta.description,
		inputSchema: {
			type: "object",
			properties,
			required,
		},
	};
}

/**
 * Metadata file structure
 */
export interface MetadataFile {
	version: string;
	generatedAt: string;
	commands: CommandMeta[];
	descriptions?: Record<string, string>;
}

export type HandWrittenCommandKind =
	| "root"
	| "leafOverride"
	| "leaf"
	| "subgroup";

export type HandWrittenCommandMeta = CommandMeta & {
	handWritten: {
		kind: HandWrittenCommandKind;
		overrides: boolean;
		dir: string;
		emitKey?: string;
		parent?: string;
	};
};

/**
 * Generate the complete metadata file as a JSON string
 *
 * @param commands - Array of all CommandMeta objects
 * @returns Pretty-printed JSON string for the metadata file
 */
export function generateMetadataFile(
	commands: CommandMeta[],
	descriptions?: Record<string, string>
): string {
	const metadata: MetadataFile = {
		version: "1.0",
		generatedAt: "build-time",
		commands,
	};
	if (descriptions && Object.keys(descriptions).length > 0) {
		metadata.descriptions = descriptions;
	}

	return JSON.stringify(metadata, null, 2);
}

/**
 * Tools file structure for cf --tools output
 */
export interface ToolsFile {
	version: string;
	tools: ToolDefinition[];
}

/**
 * Generate the tools file as a JSON string (for cf --tools command)
 *
 * @param commands - Array of all CommandMeta objects
 * @returns Pretty-printed JSON string for the tools file
 */
export function generateToolsFile(commands: CommandMeta[]): string {
	const tools = commands.map(generateToolDefinition);

	const toolsFile: ToolsFile = {
		version: "1.0",
		tools,
	};

	return JSON.stringify(toolsFile, null, 2);
}

/**
 * Schema info for a single command's API operation.
 * Used by `cf schema` to expose full request/response structure.
 */
export interface SchemaInfo {
	/** OpenAPI operation ID */
	operationId: string;
	/** HTTP method (GET, POST, etc.) */
	httpMethod: string;
	/** API path template */
	path: string;
	/** Path parameters */
	pathParams: { name: string; type: string; required: boolean }[];
	/** Query parameters */
	queryParams: { name: string; type: string; required: boolean }[];
	/** Whether the operation accepts a request body */
	hasRequestBody: boolean;
	/** Request body fields derived from schema args (non-path-param args) */
	requestBodyFields: {
		name: string;
		type: string;
		required: boolean;
		description: string;
	}[];
}

/**
 * Generate schema info for a single command.
 * Returns null if the method has no API reference.
 */
export function generateSchemaInfo(
	method: Schema.method,
	resourceName: string,
	groupName?: string
): SchemaInfo | null {
	if (!method.operationId) return null;

	const opInfo = resolveOperation(method.operationId);
	if (!opInfo) return null;

	// Request body fields come from the same derivation the CLI uses, so
	// `cf schema` matches the actual surface. `method.args` is always
	// empty in the autoDerive world (deriveArgsFromOp asserts it), so the
	// old flattenArgs(method.args) path produced [] for every command.
	const derived = deriveArgsFromOp(method, resourceName, opInfo);
	applyOptionalParentDowngrade(derived);
	const requestBodyFields = derived.args
		.filter((arg) => arg.origin.kind === "body")
		.map((arg) => ({
			name: arg.name,
			type: argScalarType(arg),
			required: arg.required === true,
			description: arg.description,
		}));

	return {
		operationId: method.operationId,
		httpMethod: opInfo.method.toUpperCase(),
		path: opInfo.path,
		pathParams: opInfo.pathParams.map((p) => ({
			name: p.name,
			type: p.type,
			required: p.required,
		})),
		queryParams: opInfo.queryParams.map((p) => ({
			name: p.name,
			type: p.type,
			required: p.required,
		})),
		hasRequestBody: opInfo.hasRequestBody,
		requestBodyFields,
	};
}

/**
 * Schema file structure for `cf schema` output
 */
export interface SchemaFile {
	version: string;
	generatedAt: string;
	schemas: Record<string, SchemaInfo>;
}

/**
 * Generate the schema file as a JSON string
 *
 * @param schemas - Map of command path to SchemaInfo
 * @returns Pretty-printed JSON string for the schema file
 */
export function generateSchemaFile(schemas: Map<string, SchemaInfo>): string {
	const schemaFile: SchemaFile = {
		version: "1.0",
		generatedAt: "build-time",
		// Sort keys for deterministic output — map insertion order varies due to parallel generation
		schemas: Object.fromEntries(
			[...schemas.entries()].sort(([a], [b]) => a.localeCompare(b))
		),
	};

	return JSON.stringify(schemaFile, null, 2);
}
