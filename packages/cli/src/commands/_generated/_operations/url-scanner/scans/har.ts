/** @generated from urlscanner-get-scan-har-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/har/${request.scan_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
