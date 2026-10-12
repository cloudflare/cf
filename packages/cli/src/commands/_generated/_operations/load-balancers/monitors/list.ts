/** @generated from account-load-balancer-monitors-list-monitors */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors`,
} as const;
