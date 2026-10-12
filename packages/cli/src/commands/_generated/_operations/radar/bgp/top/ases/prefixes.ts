/** @generated from radar-get-bgp-top-asns-by-prefixes */
export default {
	method: "GET",
	path: () => "/radar/bgp/top/ases/prefixes",
	query: ["country", "limit", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
