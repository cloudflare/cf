/** @generated from secondary-dns-(-acl)-delete-acl */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls/${request.acl_id}`,
} as const;
