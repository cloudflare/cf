/** @generated from browser-run.script.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/script`,
	query: ["keep_alive", "lab", "recording", "browser"],
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		408: "RequestTimeoutError",
		413: "ContentTooLargeError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
