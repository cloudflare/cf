/** @generated from urlscanner-create-scan-bulk-v2 */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/bulk`,
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
	},
} as const;
