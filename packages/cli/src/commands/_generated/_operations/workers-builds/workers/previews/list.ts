/** @generated from workers-builds.workers.previews.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/previews",
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
