/** @generated from updateZoneSnippet */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets/${request.snippet_name}`,
	pathParams: ["zone_id", "snippet_name"],
	body: "form",
} as const;
