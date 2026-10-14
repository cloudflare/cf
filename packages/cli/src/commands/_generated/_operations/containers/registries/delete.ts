/** @generated from containers.registries.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/registries/${request.domain}`,
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
