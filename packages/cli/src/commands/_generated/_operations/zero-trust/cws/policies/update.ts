/** @generated from cws-update-policy */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/policies/${request.policy_id}`,
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
