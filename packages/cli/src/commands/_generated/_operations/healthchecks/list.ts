/** @generated from healthchecks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/healthchecks`,
	query: ["page", "per_page"],
} as const;
