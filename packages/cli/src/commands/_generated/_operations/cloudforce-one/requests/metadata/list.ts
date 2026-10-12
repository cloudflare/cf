/** @generated from cloudforce-one.requests.metadata.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/metadata`,
	query: ["request_type", "country"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
