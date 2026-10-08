/** @generated from realtime.moq.relays.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/moq/relays/{relay_id}",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
