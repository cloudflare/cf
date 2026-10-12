/** @generated from radar.annotations.outages.get */
export default {
	method: "GET",
	path: () => "/radar/annotations/outages",
	query: [
		"limit",
		"offset",
		"dateRange",
		"dateStart",
		"dateEnd",
		"dataSource",
		"outageType",
		"outageCause",
		"tags",
		"query",
		"asn",
		"location",
		"geoId",
		"origin",
		"tld",
		"ca",
		"log",
		"bot",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
