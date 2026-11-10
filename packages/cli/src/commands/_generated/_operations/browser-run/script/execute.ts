/** @generated from browser-run.script.execute */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/script/${request.session_id}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		408: "RequestTimeoutError",
		410: "GoneError",
		413: "ContentTooLargeError",
		422: "UnprocessableEntityError",
		500: "InternalServerError",
	},
} as const;
