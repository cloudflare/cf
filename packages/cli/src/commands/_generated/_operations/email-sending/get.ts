/** @generated from email-sending-get-email-message */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/sending/messages/${request.message_id}`,
	response: "binary-response",
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
