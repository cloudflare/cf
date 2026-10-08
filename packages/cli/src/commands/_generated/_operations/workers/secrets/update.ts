/** @generated from workers.secrets.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/workers/scripts/{script_name}/secrets",
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
