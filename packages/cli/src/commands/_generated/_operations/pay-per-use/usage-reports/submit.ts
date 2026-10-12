/** @generated from pay-per-use.submitUsageReport */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-use/usage-reports`,
	body: "json",
	contentType: "application/jsonl",
	errors: {
		400: "BadRequestError",
		401: "UnauthorizedError",
		403: "ForbiddenError",
		413: "ContentTooLargeError",
		415: "UnsupportedMediaTypeError",
		422: "UnprocessableEntityError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
