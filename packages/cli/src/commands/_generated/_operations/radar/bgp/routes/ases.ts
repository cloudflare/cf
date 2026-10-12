/** @generated from radar-get-bgp-routes-asns */
export default {
	method: "GET",
	path: () => "/radar/bgp/routes/ases",
	query: ["location", "limit", "sortBy", "sortOrder", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
