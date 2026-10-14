/** @generated from iam.sso.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors/${request.sso_connector_id}`,
	body: "json",
} as const;
