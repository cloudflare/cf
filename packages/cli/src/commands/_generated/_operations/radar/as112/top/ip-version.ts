/** @generated from radar.as112.top.ip-version */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/as112/top/locations/ip_version/${request.ip_version}`,
	query: [
		"limit",
		"name",
		"dateRange",
		"dateStart",
		"dateEnd",
		"location",
		"continent",
		"format",
	],
	errors: {
		404: "NotFoundError",
	},
} as const;
