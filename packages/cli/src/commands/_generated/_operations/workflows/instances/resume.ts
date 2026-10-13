/** @generated from workflows.instances.resume */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances/${request.instance_id}/status`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
