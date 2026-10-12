/** @generated from radar.entities.locations.list */
export default {
	method: "GET",
	path: () => "/radar/entities/locations",
	query: [
		"limit",
		"offset",
		"location",
		"region",
		"subregion",
		"continent",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
