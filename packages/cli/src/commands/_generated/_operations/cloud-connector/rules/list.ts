/** @generated from zone-cloud-connector-rules */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cloud_connector/rules`,
} as const;
