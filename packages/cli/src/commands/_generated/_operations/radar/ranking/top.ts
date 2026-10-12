/** @generated from radar-get-ranking-top-domains */
export default {
	method: "GET",
	path: () => "/radar/ranking/top",
	query: [
		"limit",
		"name",
		"location",
		"domainCategory",
		"date",
		"rankingType",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
