/** @generated from email-sending.send */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/send`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		409: "ConflictError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
