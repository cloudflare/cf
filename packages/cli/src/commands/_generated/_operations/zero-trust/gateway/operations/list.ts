/** @generated from zero-trust-gateway-operations-list-zero-trust-gateway-operations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/operations`,
} as const;
