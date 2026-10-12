/** @generated from cloudforce-one.requests.quota.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/quota`,
	response: false,
	errors: {
		404: "NotFoundError",
		422: "UnprocessableEntityError",
	},
} as const;
