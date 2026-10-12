/** @generated from dns.settings.account.nameserver-sets.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets/${request.nameserver_set_id}`,
} as const;
