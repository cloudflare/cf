/** @generated from init-new-sso-connector */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors`,
	body: "json",
} as const;
