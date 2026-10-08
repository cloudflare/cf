/** @generated from email-sending.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/email/sending/messages/{message_id}",
	response: "binary-response",
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
