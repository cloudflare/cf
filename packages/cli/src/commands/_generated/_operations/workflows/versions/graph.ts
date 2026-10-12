/** @generated from wor-describe-workflow-versions-graph */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/versions/${request.version_id}/graph`,
	errors: {
		404: "NotFoundError",
	},
} as const;
