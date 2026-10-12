/** @generated from user.tokens.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/user/tokens/${request.token_id}`,
} as const;
