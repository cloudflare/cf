/** @generated from containers.registries.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/registries`,
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
