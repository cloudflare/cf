/** @generated from workers.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workers/workers/{worker_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
