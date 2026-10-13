/** @generated from snippets.rules.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/snippet_rules`,
	body: "json",
} as const;
