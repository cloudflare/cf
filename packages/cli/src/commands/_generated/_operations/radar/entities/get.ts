/** @generated from radar.entities.get */
export default {
	method: "GET",
	path: () => "/radar/entities/ip",
	query: ["ip", "format"],
	errors: {
		404: "NotFoundError",
	},
} as const;
