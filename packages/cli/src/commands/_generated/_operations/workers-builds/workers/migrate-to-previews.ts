/** @generated from workers-builds.workers.migrate-to-previews */
export default {
	method: "POST",
	path: "/accounts/{account_id}/builds/workers/{script_tag}/migrate_to_previews",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
