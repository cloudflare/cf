/** @generated from cloudforce-one.requests.get-request-read */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/${request.request_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
