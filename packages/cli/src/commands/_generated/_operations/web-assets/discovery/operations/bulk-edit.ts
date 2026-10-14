/** @generated from web-assets.discovery.operations.bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/discovery/operations`,
	body: "json",
} as const;
