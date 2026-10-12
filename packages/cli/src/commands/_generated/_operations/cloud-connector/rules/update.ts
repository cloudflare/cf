/** @generated from zone-cloud-conenctor-rules-put */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cloud_connector/rules`,
	body: "json",
} as const;
