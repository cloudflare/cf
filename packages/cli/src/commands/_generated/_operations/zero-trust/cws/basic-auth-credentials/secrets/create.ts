/** @generated from cws-create-basic-auth-secret */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials/${request.credential_id}/secrets`,
	body: "json",
	errors: {
		503: "ServiceUnavailableError",
	},
} as const;
