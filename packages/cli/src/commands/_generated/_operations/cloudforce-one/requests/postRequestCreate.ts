/** @generated from post_RequestCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
