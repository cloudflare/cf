/** @generated from radar.tlds.list */
export default {
	method: "GET",
	path: () => "/radar/tlds",
	query: ["limit", "offset", "tldManager", "tldType", "tld", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
