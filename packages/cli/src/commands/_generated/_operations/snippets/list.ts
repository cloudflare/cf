/** @generated from snippets.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/snippets`,
	query: ["page", "per_page"],
} as const;
