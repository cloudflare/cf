/** @generated from getZoneSnippetContent */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/${request.snippet_name}/content`,
	response: false,
} as const;
