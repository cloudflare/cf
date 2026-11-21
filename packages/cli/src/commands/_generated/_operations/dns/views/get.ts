/** @generated from dns.views.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views/${request.view_id}`,
} as const;
