/** @generated from realtime.moq.relays.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/moq/relays",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		413: "ContentTooLargeError",
		500: "InternalServerError",
	},
} as const;
