/** @generated from zero-trust.cws.domain-acls.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/domain-acls/${request.domain_acl_id}`,
} as const;
