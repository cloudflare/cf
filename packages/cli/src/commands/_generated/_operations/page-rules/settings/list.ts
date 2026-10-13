/** @generated from page-rules.settings.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules/settings`,
} as const;
