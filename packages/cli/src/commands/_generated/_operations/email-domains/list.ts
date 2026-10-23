/** @generated from email-domains.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/domains`,
	query: ["per_page", "cursor", "hostname", "include"],
	joined: ["per_page", "cursor", "hostname", "include"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		500: "InternalServerError",
		503: "ServiceUnavailableError",
	},
} as const;
