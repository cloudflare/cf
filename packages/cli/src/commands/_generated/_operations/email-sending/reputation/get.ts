/** @generated from email-sending.reputation.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/reputation`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
