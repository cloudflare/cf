/** @generated from deleteDeployHook */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_name}/deploy_hooks/${request.deploy_hook_uuid}`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
