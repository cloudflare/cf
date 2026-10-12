/** @generated from radar.entities.asns.ip */
export default {
	method: "GET",
	path: () => "/radar/entities/asns/ip",
	query: ["ip", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
