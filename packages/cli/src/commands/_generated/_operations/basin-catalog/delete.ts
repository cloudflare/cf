/** @generated from basin-catalog.delete */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/basin-catalog/${request.bucket_name}/delete`,
	query: ["force"],
	response: false,
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		404: "NotFoundError",
		409: "ConflictError",
		500: "InternalServerError",
	},
} as const;
