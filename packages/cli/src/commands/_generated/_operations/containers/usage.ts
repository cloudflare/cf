/** @generated from containers.usage */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/usage`,
	errors: {
		401: "UnauthorizedError",
		403: "ForbiddenError",
		500: "InternalServerError",
	},
} as const;
