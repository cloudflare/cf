/** @generated from radar-get-asns-as-set */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/entities/asns/${request.asn}/as_set`,
	query: ["format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
