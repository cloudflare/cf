/** @generated from builds.workers.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/builds/workers/{script_tag}",
	query: ["patch_existing_previews"],
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
