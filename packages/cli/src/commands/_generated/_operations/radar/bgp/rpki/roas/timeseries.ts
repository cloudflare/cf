/** @generated from radar-get-bgp-rpki-roas-timeseries */
export default {
	method: "GET",
	path: () => "/radar/bgp/rpki/roas/timeseries",
	query: [
		"dateStart",
		"dateEnd",
		"metric",
		"asn",
		"location",
		"name",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
