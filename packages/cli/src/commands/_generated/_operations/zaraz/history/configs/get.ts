/** @generated from get-zones-zone_identifier-zaraz-config-history */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/history/configs`,
	query: ["ids"],
	joined: ["ids"],
} as const;
