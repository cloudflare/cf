/** @generated from brand-protection.trial.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/brand-protection/domain/trial",
	body: "json",
	errors: {
		403: "ForbiddenError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
