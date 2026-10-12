/** @generated from updateDeployHook */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_name}/deploy_hooks/${request.deploy_hook_uuid}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
