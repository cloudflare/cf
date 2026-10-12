/** @generated from zero-trust.cws.basic-auth-credentials.secrets.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials/${request.credential_id}/secrets/${request.secret_id}`,
} as const;
