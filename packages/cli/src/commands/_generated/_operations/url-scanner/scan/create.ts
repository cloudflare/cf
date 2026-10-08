/** @generated from url-scanner.scan.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/urlscanner/scan",
	body: "json",
	errors: {
		400: "BadRequestError",
		409: "ConflictError",
		429: "TooManyRequestsError",
	},
} as const;
