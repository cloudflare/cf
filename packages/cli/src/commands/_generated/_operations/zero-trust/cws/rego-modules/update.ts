/** @generated from zero-trust.cws.rego-modules.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/rego-modules/${request.rego_module_id}`,
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
