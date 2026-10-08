/** @generated from workers-builds.workers.previews.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/previews/{preview_id}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
