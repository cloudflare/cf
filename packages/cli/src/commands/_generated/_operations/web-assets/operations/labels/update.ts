/** @generated from api-shield-operations-put-labels-to-operation */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/${request.operation_id}/labels`,
	body: "json",
} as const;
