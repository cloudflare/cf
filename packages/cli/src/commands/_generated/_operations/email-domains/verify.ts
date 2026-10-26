/** @generated from email-domains.verify */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/domains/${request.email_domain_id}/verify`,
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
