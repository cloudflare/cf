/** @generated from zero-trust.cws.domain-acls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/domain-acls/${request.domain_acl_id}`,
} as const;
