/** @generated from web-assets.discovery.operations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/api_gateway/discovery/operations/${request.discovery_id}`,
} as const;
