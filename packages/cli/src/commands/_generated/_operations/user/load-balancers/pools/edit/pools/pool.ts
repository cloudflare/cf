/** @generated from user.load-balancers.pools.edit.pools.pool */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}`,
	body: "json",
} as const;
