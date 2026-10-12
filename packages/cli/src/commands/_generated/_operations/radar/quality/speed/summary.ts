/** @generated from radar-get-quality-speed-summary */
export default {
	method: "GET",
	path: () => "/radar/quality/speed/summary",
	query: ["name", "dateEnd", "asn", "location", "continent", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
