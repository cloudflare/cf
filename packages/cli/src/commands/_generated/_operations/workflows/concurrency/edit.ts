/** @generated from workflows.concurrency.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/concurrency/${request.key_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
