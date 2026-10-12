/** @generated from account-load-balancer-pools-patch-pools */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools`,
	body: "json",
} as const;
