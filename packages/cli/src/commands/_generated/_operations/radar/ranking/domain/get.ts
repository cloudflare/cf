/** @generated from radar-get-ranking-domain-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/radar/ranking/domain/${request.domain}`,
	query: [
		"limit",
		"rankingType",
		"name",
		"includeTopLocations",
		"date",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
