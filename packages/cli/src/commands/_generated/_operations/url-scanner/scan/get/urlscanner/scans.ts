/** @generated from url-scanner.scan.get.urlscanner.scans */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/urlscanner/scan`,
	query: [
		"scan_id",
		"limit",
		"next_cursor",
		"date_start",
		"date_end",
		"url",
		"hostname",
		"path",
		"ip",
		"hash",
		"page_url",
		"page_hostname",
		"page_path",
		"page_asn",
		"page_ip",
		"account_scans",
		"is_malicious",
	],
	errors: {
		400: "BadRequestError",
	},
} as const;
