/** @generated from dns.settings.account.nameserver-sets.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets/${request.nameserver_set_id}`,
	body: "json",
} as const;
