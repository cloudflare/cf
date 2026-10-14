/** @generated from zero-trust.cws.domain-acls.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/domain-acls/${request.domain_acl_id}`,
	body: "json",
} as const;
