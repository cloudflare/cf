/** @generated from account-api-tokens-verify-token */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/tokens/verify`,
} as const;
