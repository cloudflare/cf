/** @generated from post_MessageCreate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/${request.request_id}/messages/new`,
	headers: ["Idempotency-Key"],
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
