/** @generated from radar-get-entities-asn-list */
export default {
	method: "GET",
	path: () => "/radar/entities/asns",
	query: ["limit", "offset", "asn", "location", "orderBy", "format"],
	errors: {
		400: "BadRequestError",
	},
} as const;
