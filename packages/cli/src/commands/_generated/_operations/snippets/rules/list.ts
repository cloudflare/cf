/** @generated from listZoneSnippetRules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/snippet_rules`,
} as const;
