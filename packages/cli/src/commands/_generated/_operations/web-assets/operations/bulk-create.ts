/** @generated from api-shield-endpoint-management-add-operations-to-a-zone */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations`,
	body: "json",
} as const;
