/** @generated from speed-delete-test-schedule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/schedule/${request.url}`,
	query: ["region"],
} as const;
