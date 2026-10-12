/** @generated from dns-views-for-an-account-create-internal-dns-views */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views`,
	body: "json",
} as const;
