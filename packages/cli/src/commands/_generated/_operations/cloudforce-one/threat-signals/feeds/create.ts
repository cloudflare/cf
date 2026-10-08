/** @generated from cloudforce-one.threat-signals.feeds.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/cloudforce-one/v2/threat-signals/feeds",
	body: "json",
	errors: {
		403: "ForbiddenError",
		503: "ServiceUnavailableError",
	},
} as const;
