/** @generated from speed.pages.tests.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/pages/${request.url}/tests/${request.test_id}`,
} as const;
