/** @generated from deleteManagedTransforms */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/managed_headers`,
	response: false,
} as const;
