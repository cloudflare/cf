/** @generated from page-rules-create-a-page-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pagerules`,
	body: "json",
} as const;
