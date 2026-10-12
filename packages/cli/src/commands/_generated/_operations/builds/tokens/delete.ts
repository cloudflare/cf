/** @generated from deleteBuildToken */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/tokens/${request.build_token_uuid}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
