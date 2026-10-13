/** @generated from workflows.concurrency.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workflows/concurrency/${request.key_id}`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
