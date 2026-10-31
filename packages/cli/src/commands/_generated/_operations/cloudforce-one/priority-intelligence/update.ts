/** @generated from cloudforce-one.priority-intelligence.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/${request.priority_id}`,
	body: "json",
	response: false,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
