/** @generated from account-load-balancers-list-load-balancer-usage */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/usage`,
} as const;
