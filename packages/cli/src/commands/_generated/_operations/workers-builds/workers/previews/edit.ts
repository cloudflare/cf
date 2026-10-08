/** @generated from workers-builds.workers.previews.edit */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/previews/{preview_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
