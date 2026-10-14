/** @generated from workflows.concurrency.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/concurrency`,
	query: ["per_page", "page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
