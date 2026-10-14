/** @generated from url-scanner.scan.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/scan`,
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
