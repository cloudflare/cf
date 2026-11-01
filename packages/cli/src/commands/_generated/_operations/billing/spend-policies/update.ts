/** @generated from billing.spend-policies.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/billing/spend-policies/${request.policy_id}`,
	headers: ["If-Match"],
	body: "json",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		412: "PreconditionFailedError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
