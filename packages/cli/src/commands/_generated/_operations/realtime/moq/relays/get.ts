/** @generated from realtime.moq.relays.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/moq/relays/{relay_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
