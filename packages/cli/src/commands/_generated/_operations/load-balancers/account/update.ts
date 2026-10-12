/** @generated from generated:put:/{account_or_zone}/{account_or_zone_id}/load_balancers/{load_balancer_id} */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/load_balancers/${request.load_balancer_id}`,
	body: "json",
} as const;
