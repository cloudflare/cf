/** @generated from wor-delete-workflow-instance */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances/${request.instance_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
