/** @generated from page-rules-delete-a-page-rule */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules/${request.pagerule_id}`,
} as const;
