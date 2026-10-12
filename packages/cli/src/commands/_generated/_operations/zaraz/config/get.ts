/** @generated from get-zones-zone_identifier-zaraz-config */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/config`,
} as const;
