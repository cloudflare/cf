/** @generated from listManagedTransforms */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/managed_headers`,
} as const;
