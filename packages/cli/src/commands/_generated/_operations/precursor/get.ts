/** @generated from precursor-for-a-zone-get-config */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/precursor`,
} as const;
