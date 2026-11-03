/** @generated from email-domains.changes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/domain-changes`,
	query: ["per_page", "cursor", "modified_since"],
	joined: ["per_page", "cursor", "modified_since"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
