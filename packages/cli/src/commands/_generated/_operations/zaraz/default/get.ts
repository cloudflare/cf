/** @generated from get-zones-zone_identifier-zaraz-default */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/default`,
} as const;
