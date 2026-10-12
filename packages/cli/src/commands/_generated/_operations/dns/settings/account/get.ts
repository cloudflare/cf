/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/dns_settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/dns_settings`,
} as const;
