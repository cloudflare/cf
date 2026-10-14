/** @generated from iam.sso.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors/${request.sso_connector_id}`,
} as const;
