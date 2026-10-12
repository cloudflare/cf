/** @generated from account-api-tokens-delete-token */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens/${request.token_id}`,
} as const;
