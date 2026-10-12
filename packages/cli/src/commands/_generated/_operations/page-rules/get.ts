/** @generated from page-rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules/${request.pagerule_id}`,
} as const;
