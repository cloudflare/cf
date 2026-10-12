/** @generated from load-balancers.pools.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools`,
	query: ["monitor"],
} as const;
