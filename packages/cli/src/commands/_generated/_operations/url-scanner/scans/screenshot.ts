/** @generated from url-scanner.scans.screenshot */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/v2/screenshots/${request.scan_id}.png`,
	query: ["resolution"],
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
