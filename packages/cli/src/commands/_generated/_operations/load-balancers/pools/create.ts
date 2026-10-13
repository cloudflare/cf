/** @generated from load-balancers.pools.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools`,
	body: "json",
} as const;
