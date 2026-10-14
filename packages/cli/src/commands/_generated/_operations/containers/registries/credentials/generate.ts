/** @generated from containers.registries.credentials.generate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/registries/${request.domain}/credentials`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
