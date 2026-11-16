/** @generated from workflows.instances.batch.delete */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances/batch/delete`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
