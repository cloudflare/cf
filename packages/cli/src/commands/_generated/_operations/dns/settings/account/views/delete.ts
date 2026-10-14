/** @generated from dns.settings.account.views.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views/${request.view_id}`,
} as const;
