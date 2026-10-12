/** @generated from page-rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules`,
	query: ["order", "direction", "match", "status"],
} as const;
