/** @generated from url-scanner.scan.screenshot.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/urlscanner/scan/{scan_id}/screenshot",
	query: ["resolution"],
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
