/** @generated from logs.rayid.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/logs/rayids/${request.ray_id}`,
	query: ["fields", "timestamps"],
} as const;
