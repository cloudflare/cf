import { includesAudience, selectAudience } from "@cloudflare/forge/audiences";
import type { ForgeOpenApiDocument } from "./openapi.js";

export function includesCliAudience(
	operation: Record<string, unknown>
): boolean {
	return includesAudience(operation["x-fern-audiences"], "cf-cli");
}

export function filterForCliAudience(openapi: ForgeOpenApiDocument): number {
	return selectAudience(openapi, "cf-cli");
}
