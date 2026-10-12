/** @generated from put-zones-zone_identifier-zaraz-config */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/zaraz/config`,
	body: "json",
} as const;
