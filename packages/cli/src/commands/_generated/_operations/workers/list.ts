/** @generated from workers.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/workers",
	query: ["page", "per_page", "order_by", "order"],
	errors: {
		401: "UnauthorizedError",
		500: "InternalServerError",
	},
} as const;
