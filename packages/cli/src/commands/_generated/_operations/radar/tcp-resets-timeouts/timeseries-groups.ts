/** @generated from radar.tcp-resets-timeouts.timeseries-groups */
export default {
	method: "GET",
	path: () => "/radar/tcp_resets_timeouts/timeseries_groups",
	query: [
		"aggInterval",
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
