import { requireMethodDescription } from "@cloudflare/forge";
import type { Schema } from "@cloudflare/forge";

/**
 * Uses the OpenAPI summary when available; otherwise uses the first description
 * line for compact command surfaces.
 */
export function getMethodSummary(method: Schema.method): string {
	const summary = method.summary?.replace(/\s+/g, " ").trim();
	if (summary) {
		return summary;
	}

	const description = requireMethodDescription(method).trim();
	const firstLine = description.split(/[\r\n\u2028\u2029]/, 1)[0]?.trim();
	return firstLine || description;
}

/**
 * Keeps the full operation description in leaf help without duplicating the
 * already typed inputs.
 */
export function getLeafUsage(
	method: Schema.method,
	resourceName: string,
	groupName: string | undefined,
	command: string
): string {
	const groupSegments = groupName?.split("/").filter(Boolean) ?? [];
	const commandPath = ["$0", resourceName, ...groupSegments, command].join(" ");
	return `${commandPath}\n\n${requireMethodDescription(method).trim()}`;
}
