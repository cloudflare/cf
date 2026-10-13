/** @generated from iam.sso.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors`,
	body: "json",
} as const;
