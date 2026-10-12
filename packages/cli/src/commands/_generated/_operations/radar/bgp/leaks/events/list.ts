/** @generated from radar-get-bgp-route-leak-events */
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
