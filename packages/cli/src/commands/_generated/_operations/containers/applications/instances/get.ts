/** @generated from getContainerInstance */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/applications/${request.application_id}/instances/${request.instance_id}`,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
