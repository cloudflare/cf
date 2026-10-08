/** @generated from radar.traffic-anomalies.get-by-id */
export default {
	method: "GET",
	path: "/radar/traffic_anomalies/{uuid}",
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
