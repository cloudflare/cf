/** @generated from account-api-tokens-create-token */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens`,
	body: "json",
} as const;
