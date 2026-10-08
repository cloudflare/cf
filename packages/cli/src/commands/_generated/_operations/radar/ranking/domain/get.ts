/** @generated from radar.ranking.domain.get */
export default {
	method: "GET",
	path: "/radar/ranking/domain/{domain}",
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
