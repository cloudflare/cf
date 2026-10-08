/** @generated from radar.bgp.routes.upstreams.timeseries */
export default {
	method: "GET",
	path: "/radar/bgp/routes/upstreams/{asn}/timeseries",
	query: ["ipVersion", "dateStart", "dateEnd", "limit", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
