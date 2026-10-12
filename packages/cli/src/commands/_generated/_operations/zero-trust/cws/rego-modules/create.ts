/** @generated from zero-trust.cws.rego-modules.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-modules`,
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
