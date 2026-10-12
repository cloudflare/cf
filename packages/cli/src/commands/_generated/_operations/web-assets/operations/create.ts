/** @generated from api-shield-endpoint-management-add-operation-to-a-zone */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/item`,
	body: "json",
} as const;
