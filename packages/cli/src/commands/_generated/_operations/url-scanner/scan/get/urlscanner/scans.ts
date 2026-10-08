/** @generated from url-scanner.scan.get.urlscanner.scans */
export default {
	method: "GET",
	path: "/accounts/{account_id}/urlscanner/scan",
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
