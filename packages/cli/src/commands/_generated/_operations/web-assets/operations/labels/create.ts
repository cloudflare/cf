/** @generated from web-assets.operations.labels.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/${request.operation_id}/labels`,
	body: "json",
} as const;
