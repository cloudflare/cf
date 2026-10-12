/** @generated from zero-trust-gateway-categories-list-categories */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/categories`,
} as const;
