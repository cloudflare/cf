/** @generated from account-load-balancer-pools-patch-pool */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools/${request.pool_id}`,
	body: "json",
} as const;
