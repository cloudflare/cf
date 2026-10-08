/** @generated from builds.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/builds/{build_uuid}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
