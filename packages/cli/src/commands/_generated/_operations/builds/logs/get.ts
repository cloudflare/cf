/** @generated from builds.logs.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/builds/{build_uuid}/logs",
	query: ["cursor"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
