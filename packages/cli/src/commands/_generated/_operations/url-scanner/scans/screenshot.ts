/** @generated from url-scanner.scans.screenshot */
export default {
	method: "GET",
	path: "/accounts/{account_id}/urlscanner/v2/screenshots/{scan_id}.png",
	query: ["resolution"],
	response: "binary-response",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
