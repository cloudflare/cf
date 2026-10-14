/** @generated from accounts.tokens.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens`,
	body: "json",
} as const;
