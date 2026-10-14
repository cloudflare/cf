/** @generated from acm.custom-trust-store.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/acm/custom_trust_store`,
	body: "json",
} as const;
