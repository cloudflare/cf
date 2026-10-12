/** @generated from radar-get-asns-rel */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/entities/asns/${request.asn}/rel`,
	query: ["asn2", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
