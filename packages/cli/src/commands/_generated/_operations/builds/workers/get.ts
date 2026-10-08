/** @generated from builds.workers.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/workers/{script_tag}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
