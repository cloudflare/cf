/** @generated from zero-trust.cws.rego-modules.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/cws/rego-modules/{rego_module_id}",
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
