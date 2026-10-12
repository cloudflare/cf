/** @generated from load-balancers.pools.health.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools/${request.pool_id}/preview`,
	body: "json",
} as const;
