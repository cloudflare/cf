/** @generated from dns-settings-for-an-account-list-custom-nameserver-sets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets`,
	query: ["page", "per_page"],
} as const;
