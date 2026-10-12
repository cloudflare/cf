/** @generated from load-balancer-healthcheck-events-list-healthcheck-events */
export default {
	method: "GET",
	path: () => "/user/load_balancing_analytics/events",
	query: [
		"until",
		"pool_name",
		"origin_healthy",
		"pool_id",
		"since",
		"origin_name",
		"pool_healthy",
	],
} as const;
