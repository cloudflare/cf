/** @generated from radar.bgp.leaks.events.list */
export default {
	method: "GET",
	path: () => "/radar/bgp/leaks/events",
	query: [
		"page",
		"per_page",
		"eventId",
		"leakAsn",
		"involvedAsn",
		"involvedCountry",
		"dateRange",
		"dateStart",
		"dateEnd",
		"sortBy",
		"sortOrder",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
