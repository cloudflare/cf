import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { type ForgeOpenApiDocument, initFromOpenApi } from "@cloudflare/forge";
import { filterForCliAudience } from "./generator/cli-audience.js";
import { hasAccountOrZoneScope } from "./generator/util.js";
import { preserveWorkersSecretUpdatePositional } from "./generator/workers-secret-cli-compat.js";

const bundle = process.env.FORGE_OPENAPI_BUNDLE;
// Bump this SHA to generate the commands from a new release.
const FORGE_OPENAPI_VERSION = "995446172c0e88607283d1aae00f3c1f41294d4b";
const FORGE_OPENAPI_RELEASE = `openapi@${FORGE_OPENAPI_VERSION}`;
const FORGE_OPENAPI_ASSET = "openapi.forge.json";
const FORGE_OPENAPI_ASSET_URL = `https://github.com/cloudflare/forge/releases/download/${FORGE_OPENAPI_RELEASE}/${FORGE_OPENAPI_ASSET}`;
const HTTP_METHODS = [
	"get",
	"put",
	"post",
	"delete",
	"options",
	"head",
	"patch",
	"trace",
] as const;

type OpenApiObject = Record<string, unknown>;

function isRecord(value: unknown): value is OpenApiObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolveLocalParameter(
	openapi: ForgeOpenApiDocument,
	value: unknown
): OpenApiObject | undefined {
	if (!isRecord(value)) {
		return undefined;
	}
	const ref = value["$ref"];
	if (typeof ref !== "string") {
		return value;
	}
	const prefix = "#/components/parameters/";
	if (!ref.startsWith(prefix)) {
		return undefined;
	}
	const name = ref
		.slice(prefix.length)
		.replaceAll("~1", "/")
		.replaceAll("~0", "~");
	const components = openapi.components?.parameters;
	if (!components || !(name in components)) {
		return undefined;
	}
	const resolved = components[name];
	return isRecord(resolved) ? resolved : undefined;
}

async function fetchForgeOpenApi(): Promise<unknown> {
	console.log(`[cf-generator] Using Forge OpenAPI ${FORGE_OPENAPI_RELEASE}`);
	const assetResponse = await fetch(FORGE_OPENAPI_ASSET_URL);
	if (!assetResponse.ok) {
		throw new Error(
			`Failed to fetch Forge OpenAPI asset from ${FORGE_OPENAPI_ASSET_URL} (${assetResponse.status} ${assetResponse.statusText})`
		);
	}
	return assetResponse.json();
}

function ignoreInvalidHiddenOperations(openapi: ForgeOpenApiDocument): void {
	for (const [path, pathItem] of Object.entries(openapi.paths ?? {})) {
		if (!pathItem) {
			continue;
		}

		for (const method of HTTP_METHODS) {
			const operation = pathItem[method];
			if (!operation || operation["x-forge-hidden"] !== true) {
				continue;
			}

			const responseCodes = Object.keys(operation.responses ?? {});
			const hasSuccessResponse = responseCodes.some(
				(code) => code === "101" || code === "2XX" || /^2\d{2}$/.test(code)
			);
			if (hasSuccessResponse) {
				continue;
			}

			operation["x-fern-ignore"] = true;
			console.warn(
				`[cf-generator] Ignoring hidden operation without a success response: ${method.toUpperCase()} ${path} (found: ${responseCodes.join(", ") || "none"})`
			);
		}
	}
}

/**
 * Prepare the API's combined account/zone routes for CLI generation.
 *
 * These operations intentionally model two concrete routes with the adjacent
 * `/{account_or_zone}/{account_or_zone_id}/` pair. They currently have no
 * operationId, so Forge cannot add them to the command tree, and a small
 * subset still references an account-id parameter under the second template
 * slot. Assigning the stable `generated:<verb>:<path>` id lets Forge include
 * them.
 *
 * Do not generalise this to arbitrary mismatched parameters: the paired
 * placeholders have specific runtime semantics in the CLI (accounts by
 * default, zones when --zone is explicitly supplied).
 */
function prepareAccountOrZoneOperations(openapi: ForgeOpenApiDocument): void {
	let operationCount = 0;
	let commandCount = 0;
	let parameterCount = 0;
	for (const [path, pathItem] of Object.entries(openapi.paths ?? {})) {
		if (!pathItem || !hasAccountOrZoneScope(path)) {
			continue;
		}

		const parameterOwners: OpenApiObject[] = [pathItem as OpenApiObject];
		for (const method of HTTP_METHODS) {
			const operation = pathItem[method];
			if (operation) {
				parameterOwners.push(operation as OpenApiObject);
				operationCount++;

				const group = operation["x-fern-sdk-group-name"];
				const hasCommandGroup =
					(typeof group === "string" && group.length > 0) ||
					(Array.isArray(group) &&
						group.some((item) => typeof item === "string"));
				const generatesCommand =
					hasCommandGroup &&
					operation["x-fern-ignore"] !== true &&
					operation["x-fern-availability"] !== "deprecated";
				if (generatesCommand) {
					operation.operationId ??= `generated:${method}:${path}`;
					// These operations were hidden while Forge could not represent the
					// combined scope. They are regular generated commands now that the
					// CLI resolves the pair itself.
					operation["x-forge-hidden"] = false;
					commandCount++;
				}
			}
		}

		for (const owner of parameterOwners) {
			const parameters = owner["parameters"];
			if (!Array.isArray(parameters)) {
				continue;
			}
			const resolved = parameters.map((parameter) =>
				resolveLocalParameter(openapi, parameter)
			);
			if (
				resolved.some(
					(parameter) =>
						parameter?.["in"] === "path" &&
						parameter["name"] === "account_or_zone_id"
				)
			) {
				continue;
			}

			const index = resolved.findIndex(
				(parameter) =>
					parameter?.["in"] === "path" &&
					(parameter["name"] === "account_id" ||
						parameter["name"] === "account_identifier" ||
						parameter["name"] === "accountId")
			);
			const parameter = resolved[index];
			if (index < 0 || !parameter) {
				continue;
			}
			parameters[index] = { ...parameter, name: "account_or_zone_id" };
			parameterCount++;
		}
	}

	console.warn(
		`[cf-generator] Prepared ${operationCount} account-or-zone operation(s), enabled ${commandCount} command(s), and repaired ${parameterCount} paired id parameter(s)`
	);
}

const source = (
	bundle ? JSON.parse(readFileSync(bundle, "utf8")) : await fetchForgeOpenApi()
) as ForgeOpenApiDocument;
ignoreInvalidHiddenOperations(source);
prepareAccountOrZoneOperations(source);

const { transformer } = await import("./generator/index.ts");
preserveWorkersSecretUpdatePositional(source);
const audienceExcluded = filterForCliAudience(source);
console.log(
	`[cf-generator] Excluded ${audienceExcluded} operation(s) not targeting the cf-cli audience`
);
const forge = initFromOpenApi(source);
const files = await forge.transform(transformer);
const generatedDir = fileURLToPath(
	new URL("./src/commands/_generated", import.meta.url)
);
const written = await forge.finalize(generatedDir, files, { clean: true });
console.log(`CLI: wrote ${written.length} files`);

// Format generated TypeScript so diffs are reviewable. Previously
// `formatTypeScript()` lived inside forge; we pulled it out so forge stays
// formatter-agnostic.
try {
	const vitePlusDir = dirname(
		fileURLToPath(import.meta.resolve("vite-plus/package.json"))
	);
	execFileSync(
		process.execPath,
		[join(vitePlusDir, "bin", "vp"), "fmt", generatedDir],
		{
			stdio: "inherit",
		}
	);
	console.log("CLI: formatted generated files");
} catch (err) {
	console.warn("CLI: Vite+ post-format failed (continuing)", err);
}
