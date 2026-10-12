/** @generated from wor-get-workflow-instance-step */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances/${request.instance_id}/step`,
	query: ["name", "type", "attempt"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
