/** @generated from zaraz.history.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/history`,
	query: ["offset", "limit", "sortField", "sortOrder"],
} as const;
