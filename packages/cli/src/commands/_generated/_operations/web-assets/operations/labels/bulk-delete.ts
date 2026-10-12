/** @generated from api-shield-operations-bulk-delete-labels-to-operations */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/labels`,
	body: "json",
} as const;
