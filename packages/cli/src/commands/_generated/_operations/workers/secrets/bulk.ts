/** @generated from workers.secrets.bulk */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workers/scripts/{script_name}/secrets-bulk",
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
