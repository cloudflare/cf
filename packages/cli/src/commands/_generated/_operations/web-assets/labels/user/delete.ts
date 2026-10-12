/** @generated from api-shield-delete-user-label */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/user/${request.name}`,
} as const;
