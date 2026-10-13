/** @generated from email-sending.limits.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/limits`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
