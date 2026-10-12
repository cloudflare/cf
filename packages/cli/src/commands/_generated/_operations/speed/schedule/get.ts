/** @generated from speed-get-scheduled-test */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/schedule/${request.url}`,
	query: ["region"],
} as const;
