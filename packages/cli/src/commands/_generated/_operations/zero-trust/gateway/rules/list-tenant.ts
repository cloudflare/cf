/** @generated from zero-trust.gateway.rules.list-tenant */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules/tenant`,
} as const;
