/** @generated from radar-get-ranking-top-internet-services */
export default {
	method: "GET",
	path: () => "/radar/ranking/internet_services/top",
	query: ["serviceCategory", "limit", "name", "date", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
