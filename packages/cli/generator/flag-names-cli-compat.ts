import type { ForgeOpenApiDocument, OpenApiOperation } from "./openapi.js";

interface TemporaryFlagName {
	readonly method: "put";
	readonly path: string;
	readonly operationId: string;
	/** A top-level field of the JSON request body or of one of its shapes. */
	readonly wire: string;
	readonly type: "string";
	readonly flagName: string;
}

/**
 * CLI names for API fields whose wire names would take a flag cf owns, until
 * the pinned Forge OpenAPI sets `x-forge-params.<wire>.flagName` for them
 * (cloudflare/cf#28). Remove an entry once upstream names its field.
 *
 * Every entry is checked before any is applied, so a new pin that changes an
 * operation or field, or names it upstream, fails generation instead of
 * renaming something else.
 */
const TEMPORARY_FLAG_NAMES: readonly TemporaryFlagName[] = [
	{
		method: "put",
		path: "/zones/{zone_id}/precursor",
		operationId: "precursor-for-a-zone-update-config",
		wire: "mode",
		type: "string",
		flagName: "detection-mode",
	},
	{
		method: "put",
		path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/profile",
		operationId: "put_PirProfilePut",
		wire: "profile",
		type: "string",
		flagName: "organization-profile",
	},
];

type Overrides = Record<string, Record<string, unknown> | undefined>;

export function applyTemporaryFlagNames(openapi: ForgeOpenApiDocument): void {
	const stale = TEMPORARY_FLAG_NAMES.flatMap((entry) => {
		const reason = staleness(openapi, entry);
		return reason === undefined
			? []
			: [
					`Pinned Forge OpenAPI changed for ${entry.method.toUpperCase()} ${entry.path} body field \`${entry.wire}\` (${reason}); remove or revise its temporary CLI flag name in generator/flag-names-cli-compat.ts`,
				];
	});
	if (stale.length > 0) {
		throw new Error(stale.join("\n"));
	}
	for (const entry of TEMPORARY_FLAG_NAMES) {
		const operation = openapi.paths?.[entry.path]?.[
			entry.method
		] as OpenApiOperation;
		const overrides = (operation["x-forge-params"] ?? {}) as Overrides;
		operation["x-forge-params"] = {
			...overrides,
			[entry.wire]: { ...overrides[entry.wire], flagName: entry.flagName },
		};
	}
}

function staleness(
	openapi: ForgeOpenApiDocument,
	entry: TemporaryFlagName
): string | undefined {
	const operation = openapi.paths?.[entry.path]?.[entry.method];
	if (operation === undefined) {
		return "operation missing";
	}
	if (operation.operationId !== entry.operationId) {
		return `operationId is now ${JSON.stringify(operation.operationId)}`;
	}
	const fields = bodyFields(openapi, operation, entry.wire);
	if (fields.length === 0) {
		return "field missing";
	}
	for (const field of fields) {
		const type = fieldType(openapi, field);
		if (type !== entry.type) {
			return `field type is now ${JSON.stringify(type)}`;
		}
	}
	const overrides = operation["x-forge-params"] as Overrides | undefined;
	if (overrides?.[entry.wire]?.["flagName"] !== undefined) {
		return `upstream now sets x-forge-params["${entry.wire}"].flagName`;
	}
	return undefined;
}

function bodyFields(
	openapi: ForgeOpenApiDocument,
	operation: OpenApiOperation,
	wire: string
): Record<string, unknown>[] {
	const body = deref(openapi, operation["requestBody"]);
	const content = record(body?.["content"]);
	return shapeFields(
		openapi,
		record(content?.["application/json"])?.["schema"],
		wire,
		0
	);
}

// A body can accept several object shapes, such as an anyOf of alternatives.
// Their same-named fields share one flag name, so check each one's type.
function shapeFields(
	openapi: ForgeOpenApiDocument,
	value: unknown,
	wire: string,
	depth: number
): Record<string, unknown>[] {
	const schema = deref(openapi, value);
	if (schema === undefined || depth >= 10) {
		return [];
	}
	const field = deref(openapi, record(schema["properties"])?.[wire]);
	const shapes = ["allOf", "anyOf", "oneOf"].flatMap((key) => {
		const members = schema[key];
		return Array.isArray(members) ? members : [];
	});
	return [
		...(field === undefined ? [] : [field]),
		...shapes.flatMap((shape) => shapeFields(openapi, shape, wire, depth + 1)),
	];
}

function fieldType(
	openapi: ForgeOpenApiDocument,
	field: Record<string, unknown>
): unknown {
	let schema: Record<string, unknown> | undefined = field;
	for (let depth = 0; depth < 10 && schema !== undefined; depth++) {
		if (schema["type"] !== undefined) {
			return schema["type"];
		}
		// Forge can wrap a reference in allOf to attach property annotations.
		const allOf = schema["allOf"];
		if (!Array.isArray(allOf) || allOf.length !== 1) {
			return undefined;
		}
		schema = deref(openapi, allOf[0]);
	}
	return undefined;
}

function deref(
	openapi: ForgeOpenApiDocument,
	value: unknown
): Record<string, unknown> | undefined {
	let current = record(value);
	for (let depth = 0; depth < 10 && current !== undefined; depth++) {
		const ref = current["$ref"];
		if (typeof ref !== "string" || !ref.startsWith("#/")) {
			return current;
		}
		let target: unknown = openapi;
		for (const segment of ref.slice(2).split("/")) {
			target = record(target)?.[segment];
		}
		current = record(target);
	}
	return undefined;
}

function record(value: unknown): Record<string, unknown> | undefined {
	return typeof value === "object" && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: undefined;
}
