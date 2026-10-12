/** @generated from api-shield-labels-replace-operations-attached-to-managed-label */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/labels/managed/${request.name}/resources/operation`,
	body: "json",
} as const;
