/** @generated from builds.workers.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/workers/{script_tag}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
