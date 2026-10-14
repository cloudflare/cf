/** @generated from page-rules.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules/${request.pagerule_id}`,
	body: "json",
} as const;
