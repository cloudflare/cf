/** @generated from wor-list-workflow-instances */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/instances`,
	query: [
		"page",
		"per_page",
		"cursor",
		"direction",
		"status",
		"date_start",
		"date_end",
	],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
