/** @generated from deleteZoneSnippet */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/${request.snippet_name}`,
} as const;
