/** @generated from dns.settings.account.nameserver-sets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets`,
	body: "json",
} as const;
