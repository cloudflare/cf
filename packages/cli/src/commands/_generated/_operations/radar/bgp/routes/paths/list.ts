/** @generated from radar-get-bgp-routes-paths */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/bgp/routes/paths/${request.asn}`,
	query: ["ipVersion", "collector", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
