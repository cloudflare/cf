/** @generated from get-zones-zone_id-logs-rayids-ray_id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/rayids/${request.ray_id}`,
	query: ["fields", "timestamps"],
} as const;
