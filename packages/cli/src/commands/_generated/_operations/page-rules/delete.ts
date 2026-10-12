/** @generated from page-rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules/${request.pagerule_id}`,
} as const;
