/** @generated from containers.applications.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/applications`,
	query: ["per_page", "page_token", "name", "image"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
