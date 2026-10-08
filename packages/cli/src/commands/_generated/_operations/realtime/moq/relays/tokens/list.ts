/** @generated from realtime.moq.relays.tokens.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/moq/relays/{relay_id}/tokens",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
