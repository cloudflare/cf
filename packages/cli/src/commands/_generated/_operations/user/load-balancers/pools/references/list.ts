/** @generated from user.load-balancers.pools.references.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/load_balancers/pools/${request.pool_id}/references`,
} as const;
