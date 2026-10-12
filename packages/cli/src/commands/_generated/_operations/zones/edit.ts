/** @generated from zones-0-patch */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) => path`/zones/${request.zone_id}`,
	body: "json",
} as const;
