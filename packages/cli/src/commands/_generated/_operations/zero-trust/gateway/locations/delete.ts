/** @generated from zero-trust-gateway-locations-delete-zero-trust-gateway-location */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/locations/${request.location_id}`,
} as const;
