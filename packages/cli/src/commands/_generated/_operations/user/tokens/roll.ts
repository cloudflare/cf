/** @generated from user-api-tokens-roll-token */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/user/tokens/${request.token_id}/value`,
} as const;
