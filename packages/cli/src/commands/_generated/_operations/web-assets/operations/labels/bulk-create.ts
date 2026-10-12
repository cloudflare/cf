/** @generated from api-shield-operations-bulk-post-labels-to-operations */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/labels`,
	body: "json",
} as const;
