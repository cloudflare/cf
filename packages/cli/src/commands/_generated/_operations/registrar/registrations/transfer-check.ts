/** @generated from registrar.registrations.transfer-check */
export default {
	method: "POST",
	path: "/accounts/{account_id}/registrar/domain-transfer-check",
	body: "json",
	errors: {
		400: "BadRequestError",
		503: "ServiceUnavailableError",
	},
} as const;
