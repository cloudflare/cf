/** @generated from radar.ranking.domain.get */
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
