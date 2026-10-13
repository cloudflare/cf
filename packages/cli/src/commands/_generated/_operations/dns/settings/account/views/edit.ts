/** @generated from dns.settings.account.views.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views/${request.view_id}`,
	body: "json",
} as const;
