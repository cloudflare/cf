/** @generated from cws-list-basic-auth-secrets */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cws/basic-auth-credentials/${request.credential_id}/secrets`,
	query: ["cursor", "per_page", "order", "direction"],
	joined: ["cursor", "per_page", "order", "direction"],
} as const;
