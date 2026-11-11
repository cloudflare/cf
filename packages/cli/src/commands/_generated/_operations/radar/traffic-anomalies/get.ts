/** @generated from radar.traffic-anomalies.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/traffic_anomalies/${request.uuid}`,
	query: ["format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
