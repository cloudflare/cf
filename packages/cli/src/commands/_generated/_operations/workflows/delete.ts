/** @generated from wor-delete-workflow */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
