import { execFileSync, execSync } from "node:child_process";
import {
	existsSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type ForgeOpenApiDocument, initFromOpenApi } from "@cloudflare/forge";
import { filterForCliAudience } from "./generator/cli-audience.js";
import { dropSdkMethodGroupCollisions } from "./generator/sdk-method-group-collisions.js";
import { hasAccountOrZoneScope } from "./generator/util.js";
import { forceEnableWorkersSecrets } from "./generator/workers-secret-cli-override.js";

const bundle = process.env.FORGE_OPENAPI_BUNDLE;
const sdkDir = fileURLToPath(new URL("./src/sdk", import.meta.url));
const sdkEntrypointPath = join(sdkDir, "sdk/index.ts");
const sdkVersionPath = join(sdkDir, "openapi-version");
// The SDK is committed. Bump this SHA to regenerate it from a new release.
const FORGE_OPENAPI_VERSION = "9053fe030901c272e245a63becbe109594584c4e";
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
 * Prepare the API's combined account/zone routes for both SDK and CLI
 * generation.
 *
 * These operations intentionally model two concrete routes with the adjacent
 * `/{account_or_zone}/{account_or_zone_id}/` pair. They currently have no
 * operationId, so Forge cannot add them to the command tree, and a small
 * subset still references an account-id parameter under the second template
 * slot. Fern already uses `generated:<verb>:<path>` for operations without an
 * id; assigning that same stable id lets the CLI and committed SDK agree.
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

const tempDir = mkdtempSync(join(tmpdir(), "cf-openapi-"));
const openapiPath = join(tempDir, "openapi.json");
try {
	const sdkVersion = existsSync(sdkVersionPath)
		? readFileSync(sdkVersionPath, "utf8").trim()
		: undefined;

	if (
		bundle !== undefined ||
		!existsSync(sdkEntrypointPath) ||
		sdkVersion !== FORGE_OPENAPI_VERSION
	) {
		console.log("[cf-generator] OpenAPI changed; regenerating SDK");
		writeFileSync(openapiPath, `${JSON.stringify(source, null, 2)}\n`);
		execFileSync("forge-transformer-sdk-ts", [openapiPath, "--out", sdkDir], {
			stdio: "inherit",
		});
		writeFileSync(
			sdkVersionPath,
			`${bundle === undefined ? FORGE_OPENAPI_VERSION : "preview"}\n`
		);
	} else {
		console.log("[cf-generator] OpenAPI unchanged; using committed SDK");
	}
} finally {
	rmSync(tempDir, { recursive: true, force: true });
}

const sdkCollisionResult = dropSdkMethodGroupCollisions(join(sdkDir, "sdk"));
if (sdkCollisionResult.collisions > 0) {
	console.warn(
		`[cf-generator] Dropped ${sdkCollisionResult.collisions} SDK method-group collision(s): ${sdkCollisionResult.droppedOperationIds.join(", ")}`
	);
}

const { transformer } = await import("./generator/index.ts");
const cliSource = structuredClone(source);
forceEnableWorkersSecrets(cliSource);
const audienceExcluded = filterForCliAudience(cliSource);
console.log(
	`[cf-generator] Excluded ${audienceExcluded} operation(s) not targeting the cf-cli audience`
);
const forge = initFromOpenApi(cliSource);
const files = await forge.transform(transformer);
const generatedDir = new URL("./src/commands/_generated", import.meta.url)
	.pathname;
const written = await forge.finalize(generatedDir, files, { clean: true });
console.log(`CLI: wrote ${written.length} files`);

// Format generated TypeScript so diffs are reviewable. Previously
// `formatTypeScript()` lived inside forge; we pulled it out so forge stays
// formatter-agnostic.
try {
	execSync(`pnpm exec oxfmt "${generatedDir}"`, {
		stdio: "inherit",
	});
	console.log("CLI: formatted generated files");
} catch (err) {
	console.warn("CLI: oxfmt post-format failed (continuing)", err);
}
