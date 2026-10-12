/** @generated from get-all-sso-connectors */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors`,
} as const;
