/** @generated from builds.tokens.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/tokens/{build_token_uuid}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
