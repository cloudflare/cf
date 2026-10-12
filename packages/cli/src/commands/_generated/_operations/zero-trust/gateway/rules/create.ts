/** @generated from zero-trust.gateway.rules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules`,
	body: "json",
} as const;
