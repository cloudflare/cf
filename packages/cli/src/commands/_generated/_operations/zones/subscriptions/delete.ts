/** @generated from zone-subscription-delete-zone-subscription */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/subscription`,
} as const;
