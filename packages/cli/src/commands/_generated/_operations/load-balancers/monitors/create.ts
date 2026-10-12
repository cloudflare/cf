/** @generated from account-load-balancer-monitors-create-monitor */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/load_balancers/monitors`,
	body: "json",
} as const;
