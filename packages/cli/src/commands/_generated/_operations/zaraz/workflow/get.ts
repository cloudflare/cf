/** @generated from get-zones-zone_identifier-zaraz-workflow */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/workflow`,
} as const;
