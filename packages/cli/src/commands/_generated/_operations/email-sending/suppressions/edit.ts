/** @generated from email-sending.suppressions.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/suppressions/${request.suppression_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
