/** @generated from radar.post-quantum.origin.timeseries-groups */
export default {
	method: "GET",
	path: "/radar/post_quantum/origin/timeseries_groups/{dimension}",
	query: ["name", "dateRange", "dateStart", "dateEnd", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
