/** @generated from radar-get-dns-as112-top-locations-by-ip-version */
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
