/** @generated from radar.ct.logs.list */
export default {
	method: "GET",
	path: () => "/radar/ct/logs",
	query: ["limit", "offset", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
