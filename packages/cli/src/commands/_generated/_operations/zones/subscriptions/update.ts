/** @generated from zone-subscription-update-zone-subscription */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/subscription`,
	body: "json",
} as const;
