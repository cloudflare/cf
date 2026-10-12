/** @generated from radar-get-certificate-logs */
export default {
	method: "GET",
	path: () => "/radar/ct/logs",
	query: ["limit", "offset", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
