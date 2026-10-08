/** @generated from url-scanner.scans.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/urlscanner/v2/scan",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
