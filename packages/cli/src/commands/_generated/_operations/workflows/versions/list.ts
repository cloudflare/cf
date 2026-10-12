/** @generated from wor-list-workflow-versions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/${request.workflow_name}/versions`,
	query: ["per_page", "page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
