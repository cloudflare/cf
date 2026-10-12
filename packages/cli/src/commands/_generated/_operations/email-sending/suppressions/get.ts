/** @generated from email-sending.suppressions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/suppressions/${request.suppression_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
