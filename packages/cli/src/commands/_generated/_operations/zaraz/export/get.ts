/** @generated from get-zones-zone_identifier-zaraz-export */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/export`,
} as const;
