/** @generated from zones.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) => path`/zones/${request.zone_id}`,
} as const;
