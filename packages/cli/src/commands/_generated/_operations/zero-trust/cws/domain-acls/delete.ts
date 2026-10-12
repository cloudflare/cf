/** @generated from cws-delete-domain-acl */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/domain-acls/${request.domain_acl_id}`,
} as const;
