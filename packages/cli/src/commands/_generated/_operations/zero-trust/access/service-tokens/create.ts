/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/access/service_tokens */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/service_tokens`,
	body: "json",
} as const;
