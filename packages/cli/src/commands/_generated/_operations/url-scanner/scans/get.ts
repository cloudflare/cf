/** @generated from url-scanner.scans.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/result/${request.scan_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
