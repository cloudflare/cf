/** @generated from workers-builds.workers.previews.list-builds */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/previews/{preview_id}/builds",
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
