/** @generated from load-balancers.pools.bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools`,
	body: "json",
} as const;
