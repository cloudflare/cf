/** @generated from web-assets.operations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/${request.operation_id}`,
	query: ["feature", "with_schemas"],
} as const;
