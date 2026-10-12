/** @generated from begin-sso-connector-verification */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/sso_connectors/${request.sso_connector_id}/begin_verification`,
} as const;
