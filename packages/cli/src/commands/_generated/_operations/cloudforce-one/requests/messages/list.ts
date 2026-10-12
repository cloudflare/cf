/** @generated from get_MessageList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/${request.request_id}/messages`,
	query: ["page", "per_page"],
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
