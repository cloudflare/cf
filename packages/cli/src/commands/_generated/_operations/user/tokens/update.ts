/** @generated from user-api-tokens-update-token */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/user/tokens/${request.token_id}`,
	body: "json",
} as const;
