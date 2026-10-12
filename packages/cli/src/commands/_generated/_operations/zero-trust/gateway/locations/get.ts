/** @generated from zero-trust-gateway-locations-zero-trust-gateway-location-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/locations/${request.location_id}`,
} as const;
