/** @generated from logpull-list-log-files */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/logs/list`,
	query: ["start", "end", "bucket", "prefix", "limit"],
	headers: ["R2-Access-Key-Id", "R2-Secret-Access-Key"],
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
	},
} as const;
