/** @generated from zones.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) => path`/zones/${request.zone_id}`,
} as const;
