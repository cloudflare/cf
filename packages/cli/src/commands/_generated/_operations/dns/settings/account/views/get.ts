/** @generated from dns-views-for-an-account-get-internal-dns-view */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_settings/views/${request.view_id}`,
} as const;
