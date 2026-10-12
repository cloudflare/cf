/** @generated from radar.ranking.internet-services.top */
export default {
	method: "GET",
	path: () => "/radar/ranking/internet_services/top",
	query: ["serviceCategory", "limit", "name", "date", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
