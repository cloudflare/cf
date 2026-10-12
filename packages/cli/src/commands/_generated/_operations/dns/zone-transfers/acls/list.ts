/** @generated from secondary-dns-(-acl)-list-ac-ls */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls`,
} as const;
