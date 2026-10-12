/** @generated from zone-subscription-create-zone-subscription */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/subscription`,
	body: "json",
} as const;
