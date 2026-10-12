/** @generated from delete-sso-connector */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors/${request.sso_connector_id}`,
} as const;
