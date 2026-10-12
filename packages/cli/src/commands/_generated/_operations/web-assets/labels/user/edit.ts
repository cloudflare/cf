/** @generated from api-shield-patch-user-label */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user/${request.name}`,
	body: "json",
} as const;
