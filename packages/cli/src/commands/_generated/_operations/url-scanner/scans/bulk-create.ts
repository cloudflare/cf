/** @generated from url-scanner.scans.bulk-create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/urlscanner/v2/bulk",
	body: "json",
	errors: {
		400: "BadRequestError",
		429: "TooManyRequestsError",
	},
} as const;
