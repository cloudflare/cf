/** @generated from account-load-balancer-pools-delete-pool */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools/${request.pool_id}`,
} as const;
