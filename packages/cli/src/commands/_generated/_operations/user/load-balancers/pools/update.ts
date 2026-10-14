/** @generated from user.load-balancers.pools.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}`,
	body: "json",
} as const;
