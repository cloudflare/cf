/** @generated from cloudforce-one.credential-monitor.domains.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/credential-monitor/domains",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
	},
} as const;
