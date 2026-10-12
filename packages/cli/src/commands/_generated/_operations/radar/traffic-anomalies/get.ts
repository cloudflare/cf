/** @generated from radar-get-traffic-anomalies */
export default {
	method: "GET",
	path: () => "/radar/traffic_anomalies",
	query: [
		"limit",
		"offset",
		"dateRange",
		"dateStart",
		"dateEnd",
		"status",
		"type",
		"dataSource",
		"asn",
		"location",
		"origin",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
