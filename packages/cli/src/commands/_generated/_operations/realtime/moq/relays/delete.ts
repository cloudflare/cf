/** @generated from realtime.moq.relays.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/moq/relays/{relay_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
