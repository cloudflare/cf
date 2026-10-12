/** @generated from dns-settings-for-an-account-get-custom-nameserver-set */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets/${request.nameserver_set_id}`,
} as const;
