/** @generated from load-balancer-pools-preview-pool */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}/preview`,
	body: "json",
} as const;
