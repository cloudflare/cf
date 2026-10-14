/** @generated from radar.search.global */
export default {
	method: "GET",
	path: () => "/radar/search/global",
	query: ["limit", "limitPerGroup", "query", "include", "exclude", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
