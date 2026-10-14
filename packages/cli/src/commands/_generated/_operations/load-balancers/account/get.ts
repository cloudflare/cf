/** @generated from load-balancers.account.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/load_balancers/${request.load_balancer_id}`,
} as const;
