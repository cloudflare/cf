/** @generated from dns-settings-for-an-account-create-custom-nameserver-set */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/nameserver_sets`,
	body: "json",
} as const;
