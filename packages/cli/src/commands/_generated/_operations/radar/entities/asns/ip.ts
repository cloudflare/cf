/** @generated from radar-get-entities-asn-by-ip */
export default {
	method: "GET",
	path: () => "/radar/entities/asns/ip",
	query: ["ip", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
