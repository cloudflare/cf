/** @generated from logs.list.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/logs/list",
	query: ["start", "end", "bucket", "prefix", "limit"],
	headers: ["R2-Access-Key-Id", "R2-Secret-Access-Key"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
