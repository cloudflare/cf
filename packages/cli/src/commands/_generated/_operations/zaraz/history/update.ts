/** @generated from put-zones-zone_identifier-zaraz-history */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/history`,
	body: "json",
} as const;
