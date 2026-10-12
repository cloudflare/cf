/** @generated from cws-delete-basic-auth-credential */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials/${request.credential_id}`,
} as const;
