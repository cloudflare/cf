/** @generated from radar.tcp-resets-timeouts.summary */
export default {
	method: "GET",
	path: () => "/radar/tcp_resets_timeouts/summary",
	query: [
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"asn",
		"location",
		"continent",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
