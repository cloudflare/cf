/** @generated from load-balancer-pools-pool-health-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}/health`,
} as const;
