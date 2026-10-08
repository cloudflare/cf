/** @generated from builds.deploy-hooks.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/workers/{script_name}/deploy_hooks/{deploy_hook_uuid}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
