/** @generated from accounts.tokens.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens/${request.token_id}`,
} as const;
