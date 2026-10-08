/** @generated from realtime.moq.relays.tokens.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/moq/relays/{relay_id}/tokens",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
