/** @generated from zero-trust-gateway-rules-list-zero-trust-gateway-rules-tenant */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/tenant`,
} as const;
