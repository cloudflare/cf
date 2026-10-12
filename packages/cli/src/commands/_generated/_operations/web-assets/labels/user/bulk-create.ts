/** @generated from web-assets.labels.user.bulk-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user`,
	body: "json",
} as const;
