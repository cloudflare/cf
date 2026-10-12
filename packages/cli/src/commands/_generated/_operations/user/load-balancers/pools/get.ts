/** @generated from load-balancer-pools-pool-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}`,
} as const;
