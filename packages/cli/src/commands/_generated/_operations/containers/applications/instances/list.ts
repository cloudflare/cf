/** @generated from listContainerInstances_v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/containers/applications/${request.application_id}/instances-v2`,
	query: ["per_page", "page_token", "state", "name_prefix"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
