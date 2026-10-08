/** @generated from workers.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workers/workers/{worker_id}",
	query: ["force"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
