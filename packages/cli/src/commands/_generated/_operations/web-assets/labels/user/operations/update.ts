/** @generated from web-assets.labels.user.operations.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user/${request.name}/resources/operation`,
	body: "json",
} as const;
