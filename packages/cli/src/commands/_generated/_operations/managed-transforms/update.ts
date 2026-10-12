/** @generated from managed-transforms.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/managed_headers`,
	body: "json",
} as const;
