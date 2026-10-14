/** @generated from radar.traffic-anomalies.locations.get */
export default {
	method: "GET",
	path: () => "/radar/traffic_anomalies/locations",
	query: ["limit", "dateRange", "dateStart", "dateEnd", "status", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
