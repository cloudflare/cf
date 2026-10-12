/** @generated from radar.entities.asns.botnet-threat-feed */
export default {
	method: "GET",
	path: () => "/radar/entities/asns/botnet_threat_feed",
	query: [
		"limit",
		"offset",
		"metric",
		"date",
		"compareDateRange",
		"location",
		"asn",
		"sortOrder",
		"format",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
