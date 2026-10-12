/** @generated from get-zones-zone_identifier-zaraz-history */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/history`,
	query: ["offset", "limit", "sortField", "sortOrder"],
} as const;
