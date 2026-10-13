/** @generated from zero-trust.cws.domain-acls.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/domain-acls`,
	body: "json",
} as const;
