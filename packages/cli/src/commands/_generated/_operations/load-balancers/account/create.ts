/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/load_balancers */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/load_balancers`,
	body: "json",
} as const;
