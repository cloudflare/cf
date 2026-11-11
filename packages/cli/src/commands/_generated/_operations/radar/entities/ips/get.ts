/** @generated from radar.entities.ips.get */
export default {
	method: "GET",
	path: () => "/radar/entities/ip",
	query: ["ip", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
