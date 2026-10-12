/** @generated from secondary-dns-(-acl)-acl-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls/${request.acl_id}`,
} as const;
