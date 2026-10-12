/** @generated from api-shield-operations-bulk-put-labels-to-operations */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/labels`,
	body: "json",
} as const;
