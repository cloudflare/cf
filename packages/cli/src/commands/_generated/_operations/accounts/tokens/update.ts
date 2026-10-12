/** @generated from account-api-tokens-update-token */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens/${request.token_id}`,
	body: "json",
} as const;
