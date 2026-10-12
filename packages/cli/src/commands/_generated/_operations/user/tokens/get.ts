/** @generated from user-api-tokens-token-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/user/tokens/${request.token_id}`,
} as const;
