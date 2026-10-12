/** @generated from api-shield-endpoint-management-delete-multiple-operations */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations`,
	body: "json",
} as const;
