/** @generated from user.load-balancers.pools.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}`,
} as const;
