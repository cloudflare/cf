/** @generated from url-scanner.response.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/response/${request.response_id}`,
	response: "text",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
