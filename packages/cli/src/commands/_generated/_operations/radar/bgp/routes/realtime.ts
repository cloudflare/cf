/** @generated from radar-get-bgp-routes-realtime */
export default {
	method: "GET",
	path: () => "/radar/bgp/routes/realtime",
	query: ["prefix", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
