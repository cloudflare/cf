/** @generated from radar.ranking.internet-services.categories */
export default {
	method: "GET",
	path: () => "/radar/ranking/internet_services/categories",
	query: ["limit", "name", "date", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
