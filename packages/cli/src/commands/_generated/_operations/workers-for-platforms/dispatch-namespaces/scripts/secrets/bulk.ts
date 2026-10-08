/** @generated from workers-for-platforms.dispatch-namespaces.scripts.secrets.bulk */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workers/dispatch/namespaces/{dispatch_namespace}/scripts/{script_name}/secrets-bulk",
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
