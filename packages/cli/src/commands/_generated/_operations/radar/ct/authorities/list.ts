/** @generated from radar-get-certificate-authorities */
export default {
	method: "GET",
	path: () => "/radar/ct/authorities",
	query: ["limit", "offset", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
