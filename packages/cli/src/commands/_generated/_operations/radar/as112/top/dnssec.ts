/** @generated from radar-get-dns-as112-top-locations-by-dnssec */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/as112/top/locations/dnssec/${request.dnssec}`,
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
