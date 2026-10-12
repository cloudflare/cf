/** @generated from custom-origin-trust-store-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/custom_trust_store/${request.custom_origin_trust_store_id}`,
} as const;
