/** @generated from load-balancers.account.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/load_balancers/${request.load_balancer_id}`,
	body: "json",
} as const;
