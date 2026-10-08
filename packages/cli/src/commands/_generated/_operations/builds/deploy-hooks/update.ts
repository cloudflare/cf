/** @generated from builds.deploy-hooks.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/builds/workers/{script_name}/deploy_hooks/{deploy_hook_uuid}",
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
