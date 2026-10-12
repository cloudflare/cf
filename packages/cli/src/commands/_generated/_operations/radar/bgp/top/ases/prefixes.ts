/** @generated from radar.bgp.top.ases.prefixes */
export default {
	method: "GET",
	path: () => "/radar/bgp/top/ases/prefixes",
	query: ["country", "limit", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
