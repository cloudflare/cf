/** @generated from radar-get-annotations-outages-top */
export default {
	method: "GET",
	path: () => "/radar/annotations/outages/locations",
	query: ["limit", "dateRange", "dateStart", "dateEnd", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
