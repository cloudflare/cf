/** @generated from radar.email.routing.timeseries-groups-v2 */
export default {
	method: "GET",
	path: "/radar/email/routing/timeseries_groups/{dimension}",
	query: [
		"aggInterval",
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
