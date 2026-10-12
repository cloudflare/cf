/** @generated from radar.bgp.hijacks.events.list */
export default {
	method: "GET",
	path: () => "/radar/bgp/hijacks/events",
	query: [
		"page",
		"per_page",
		"eventId",
		"hijackerAsn",
		"victimAsn",
		"involvedAsn",
		"involvedCountry",
		"prefix",
		"minConfidence",
		"maxConfidence",
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
