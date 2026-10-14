/** @generated from url-scanner.scan.screenshot.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/scan/${request.scan_id}/screenshot`,
	query: ["resolution"],
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
