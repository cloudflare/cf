/** @generated from speed-create-test */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/pages/${request.url}/tests`,
	body: "json",
} as const;
