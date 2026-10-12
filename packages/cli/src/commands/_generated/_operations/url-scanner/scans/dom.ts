/** @generated from urlscanner-get-scan-dom-v2 */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/dom/${request.scan_id}`,
	response: "text",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
