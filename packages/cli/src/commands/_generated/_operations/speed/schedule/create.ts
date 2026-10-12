/** @generated from speed-create-scheduled-test */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/speed_api/schedule/${request.url}`,
	query: ["region", "frequency"],
} as const;
