/** @generated from zero-trust-gateway-locations-update-zero-trust-gateway-location */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/locations/${request.location_id}`,
	body: "json",
} as const;
