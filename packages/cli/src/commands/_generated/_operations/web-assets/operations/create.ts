/** @generated from web-assets.operations.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/operations/item`,
	body: "json",
} as const;
