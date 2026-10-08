/** @generated from realtime.moq.relays.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/moq/relays",
	query: ["created_before", "created_after", "per_page", "asc"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
