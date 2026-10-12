/** @generated from zero-trust.gateway.rules.bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/rules`,
	body: "json",
} as const;
