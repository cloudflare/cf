/** @generated from builds.cancel */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/builds/builds/{build_uuid}/cancel",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
