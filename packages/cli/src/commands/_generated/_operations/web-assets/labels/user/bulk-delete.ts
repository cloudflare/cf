/** @generated from web-assets.labels.user.bulk-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user`,
	body: "json",
} as const;
