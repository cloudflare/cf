/** @generated from radar-get-origins */
export default {
	method: "GET",
	path: () => "/radar/origins",
	query: ["limit", "offset", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
