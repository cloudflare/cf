/** @generated from radar.bgp.routes.moas */
export default {
	method: "GET",
	path: () => "/radar/bgp/routes/moas",
	query: ["origin", "prefix", "invalid_only", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
