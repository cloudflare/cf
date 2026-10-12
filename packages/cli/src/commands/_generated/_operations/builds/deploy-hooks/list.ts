/** @generated from listDeployHooks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/builds/workers/${request.script_name}/deploy_hooks`,
	errors: {
		401: "UnauthorizedError",
	},
} as const;
