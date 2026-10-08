/** @generated from realtime.moq.relays.tokens.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/moq/relays/{relay_id}/tokens/{jti}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
