/** @generated from load-balancers.pools.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools/${request.pool_id}`,
} as const;
