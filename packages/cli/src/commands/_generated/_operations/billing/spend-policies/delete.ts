/** @generated from billing.spend-policies.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/spend-policies/${request.policy_id}`,
	headers: ["If-Match"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		412: "PreconditionFailedError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
