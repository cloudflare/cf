/** @generated from url-scanner.scan.har.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/scan/${request.scan_id}/har`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
