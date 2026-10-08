/** @generated from zero-trust.cws.rego-modules.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cws/rego-modules",
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
