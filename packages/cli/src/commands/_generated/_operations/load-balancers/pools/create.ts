/** @generated from account-load-balancer-pools-create-pool */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/pools`,
	body: "json",
} as const;
