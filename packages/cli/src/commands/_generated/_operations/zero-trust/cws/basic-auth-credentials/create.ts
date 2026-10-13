/** @generated from zero-trust.cws.basic-auth-credentials.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials`,
	body: "json",
} as const;
