/** @generated from web-assets.operations.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/${request.operation_id}`,
} as const;
