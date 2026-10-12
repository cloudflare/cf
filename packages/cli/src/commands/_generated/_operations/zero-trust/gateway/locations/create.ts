/** @generated from zero-trust-gateway-locations-create-zero-trust-gateway-location */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/locations`,
	body: "json",
} as const;
