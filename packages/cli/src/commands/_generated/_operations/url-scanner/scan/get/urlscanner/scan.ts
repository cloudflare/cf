/** @generated from url-scanner.scan.get.urlscanner.scan */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/scan/${request.scan_id}`,
	query: ["full"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
