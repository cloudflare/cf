/** @generated from speed.pages.tests.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/pages/${request.url}/tests`,
	query: ["page", "per_page", "region"],
} as const;
