/** @generated from url-scanner.scan.get.urlscanner.scan */
export default {
	method: "GET",
	path: "/accounts/{account_id}/urlscanner/scan/{scan_id}",
	query: ["full"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
