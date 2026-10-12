/** @generated from user.tokens.roll */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/user/tokens/${request.token_id}/value`,
} as const;
