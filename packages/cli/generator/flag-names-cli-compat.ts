import type { ForgeOpenApiDocument, OpenApiOperation } from "./openapi.js";

interface TemporaryFlagName {
	readonly method: "put" | "delete";
	readonly path: string;
	readonly operationId: string;
	readonly in: "body" | "query";
	readonly wire: string;
	readonly type: "string" | "boolean";
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
		in: "body",
		wire: "mode",
		type: "string",
		flagName: "detection-mode",
	},
	{
		method: "put",
		path: "/accounts/{account_id}/cloudforce-one/v2/priority-intelligence/profile",
		operationId: "put_PirProfilePut",
		in: "body",
		wire: "profile",
		type: "string",
		flagName: "organization-profile",
	},
	{
		method: "delete",
		path: "/accounts/{account_id}/magic/cloud/onramps/{onramp_id}",
		operationId: "onramps-delete",
		in: "query",
		wire: "force",
		type: "boolean",
		flagName: "force-delete",
	},
];

type Overrides = Record<string, Record<string, unknown> | undefined>;

export function applyTemporaryFlagNames(openapi: ForgeOpenApiDocument): void {
	const stale = TEMPORARY_FLAG_NAMES.flatMap((entry) => {
		const reason = staleness(openapi, entry);
		return reason === undefined
			? []
			: [
					`Pinned Forge OpenAPI changed for ${entry.method.toUpperCase()} ${entry.path} ${entry.in === "body" ? "body field" : "query parameter"} \`${entry.wire}\` (${reason}); remove or revise its temporary CLI flag name in generator/flag-names-cli-compat.ts`,
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
	const pathItem = openapi.paths?.[entry.path];
	const operation = pathItem?.[entry.method];
	if (operation === undefined) {
		return "operation missing";
	}
	if (operation.operationId !== entry.operationId) {
		return `operationId is now ${JSON.stringify(operation.operationId)}`;
	}
	const field =
		entry.in === "body"
			? bodyField(openapi, operation, entry.wire)
			: queryField(
					openapi,
					[pathItem?.["parameters"], operation.parameters],
					entry.wire
				);
	if (field === undefined) {
		return "field missing";
	}
	if (field["type"] !== entry.type) {
		return `field type is now ${JSON.stringify(field["type"])}`;
	}
	const overrides = operation["x-forge-params"] as Overrides | undefined;
	if (overrides?.[entry.wire]?.["flagName"] !== undefined) {
		return `upstream now sets x-forge-params["${entry.wire}"].flagName`;
	}
	return undefined;
}

function bodyField(
	openapi: ForgeOpenApiDocument,
	operation: OpenApiOperation,
	wire: string
): Record<string, unknown> | undefined {
	const body = deref(openapi, operation["requestBody"]);
	const content = record(body?.["content"]);
	const schema = deref(
		openapi,
		record(content?.["application/json"])?.["schema"]
	);
	return deref(openapi, record(schema?.["properties"])?.[wire]);
}

function queryField(
	openapi: ForgeOpenApiDocument,
	lists: readonly unknown[],
	wire: string
): Record<string, unknown> | undefined {
	const parameter = lists
		.flatMap((list) => (Array.isArray(list) ? list : []))
		.map((p) => deref(openapi, p))
		.find((p) => p?.["in"] === "query" && p["name"] === wire);
	return deref(openapi, parameter?.["schema"]);
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
