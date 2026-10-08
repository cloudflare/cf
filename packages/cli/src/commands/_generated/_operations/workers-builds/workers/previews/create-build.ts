/** @generated from workers-builds.workers.previews.create-build */
export default {
	method: "POST",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/previews/{preview_id}/builds",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
