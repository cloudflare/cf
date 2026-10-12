/** @generated from zero-trust.cws.policies.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies`,
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
