/** @generated from radar-get-geolocations */
export default {
	method: "GET",
	path: () => "/radar/geolocations",
	query: ["limit", "offset", "geoId", "location", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
