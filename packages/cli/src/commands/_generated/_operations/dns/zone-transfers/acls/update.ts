/** @generated from secondary-dns-(-acl)-update-acl */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls/${request.acl_id}`,
	body: "json",
} as const;
