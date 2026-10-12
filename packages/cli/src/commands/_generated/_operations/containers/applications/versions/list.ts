/** @generated from listApplicationVersions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/applications/${request.application_id}/versions`,
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
