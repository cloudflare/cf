/** @generated from custom-origin-trust-store-list-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/custom_trust_store`,
	query: ["page", "per_page", "limit", "offset"],
} as const;
