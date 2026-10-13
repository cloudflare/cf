/** @generated from radar.bgp.ips.top.ases */
export default {
	method: "GET",
	path: () => "/radar/bgp/ips/top/ases",
	query: ["date", "limit", "metric", "country", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
