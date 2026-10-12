/** @generated from radar.bgp.routes.pfx2as */
export default {
	method: "GET",
	path: () => "/radar/bgp/routes/pfx2as",
	query: ["prefix", "origin", "rpkiStatus", "longestPrefixMatch", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
