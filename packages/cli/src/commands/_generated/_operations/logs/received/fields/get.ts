/** @generated from get-zones-zone_id-logs-received-fields */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/received/fields`,
} as const;
