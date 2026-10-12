/** @generated from dns.settings.account.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/dns_settings`,
	body: "json",
} as const;
