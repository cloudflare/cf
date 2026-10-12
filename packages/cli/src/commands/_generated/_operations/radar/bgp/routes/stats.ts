/** @generated from radar.bgp.routes.stats */
export default {
	method: "GET",
	path: () => "/radar/bgp/routes/stats",
	query: ["asn", "location", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
