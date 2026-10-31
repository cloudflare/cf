/** @generated from email-domains.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/domains/${request.email_domain_id}`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
