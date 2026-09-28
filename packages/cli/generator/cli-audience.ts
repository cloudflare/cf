import type { ForgeOpenApiDocument } from "@cloudflare/forge";

const CLI_AUDIENCE = "cf-cli";
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

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * An operation without an explicit audience is available to every consumer.
 * Once audiences are declared, the operation must opt in to the cf CLI.
 */
export function includesCliAudience(
	operation: Record<string, unknown>
): boolean {
	const audiences = operation["x-fern-audiences"];
	if (audiences === undefined || audiences === null) {
		return true;
	}
	if (typeof audiences === "string") {
		return audiences === CLI_AUDIENCE;
	}
	if (Array.isArray(audiences)) {
		return audiences.some(
			(audience) => typeof audience === "string" && audience === CLI_AUDIENCE
		);
	}
	return false;
}

/**
 * Remove operations that explicitly target audiences other than `cf-cli`.
 * This runs on the CLI's OpenAPI copy, after SDK generation, so audience
 * selection cannot change the committed SDK surface.
 */
export function filterForCliAudience(openapi: ForgeOpenApiDocument): number {
	let excluded = 0;

	for (const pathItem of Object.values(openapi.paths ?? {})) {
		if (!isRecord(pathItem)) {
			continue;
		}

		for (const method of HTTP_METHODS) {
			const operation = pathItem[method];
			if (!isRecord(operation) || includesCliAudience(operation)) {
				continue;
			}

			delete pathItem[method];
			excluded++;
		}
	}

	return excluded;
}
