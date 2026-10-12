/** @generated from precursor-for-a-zone-update-config */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/precursor`,
	body: "json",
} as const;
