/** @generated from deleteZoneSnippetRules */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/snippet_rules`,
} as const;
