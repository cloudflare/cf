/** @generated from dns.settings.account.views.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views`,
	body: "json",
} as const;
