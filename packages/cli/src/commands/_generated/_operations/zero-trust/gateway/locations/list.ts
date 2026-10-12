/** @generated from zero-trust-gateway-locations-list-zero-trust-gateway-locations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/locations`,
	query: ["filter", "search", "order_by", "direction"],
} as const;
