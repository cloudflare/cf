/** @generated from web-analytics-get-rum-status */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/rum`,
} as const;
