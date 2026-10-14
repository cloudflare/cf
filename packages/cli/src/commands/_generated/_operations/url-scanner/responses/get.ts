/** @generated from url-scanner.responses.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/responses/${request.response_id}`,
	response: "text",
	errors: {
		400: "BadRequestError",
	},
} as const;
