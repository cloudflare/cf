/** @generated from radar-get-bgp-routes-upstreams-timeseries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bgp/routes/upstreams/${request.asn}/timeseries`,
	query: ["ipVersion", "dateStart", "dateEnd", "limit", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
