/** @generated from radar-get-bgp-rpki-aspa-timeseries */
export default {
	method: "GET",
	path: () => "/radar/bgp/rpki/aspa/timeseries",
	query: ["dateStart", "dateEnd", "name", "rir", "location", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
