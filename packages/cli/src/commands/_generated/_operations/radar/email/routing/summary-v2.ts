/** @generated from radar.email.routing.summary-v2 */
export default {
	method: "GET",
	path: "/radar/email/routing/summary/{dimension}",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"arc",
		"dkim",
		"dmarc",
		"spf",
		"ipVersion",
		"encrypted",
		"limitPerGroup",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
