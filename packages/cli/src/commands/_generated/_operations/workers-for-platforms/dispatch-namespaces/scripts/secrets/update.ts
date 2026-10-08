/** @generated from workers-for-platforms.dispatch-namespaces.scripts.secrets.update */
export default {
	method: "PUT",
	path: "/accounts/{account_id}/workers/dispatch/namespaces/{dispatch_namespace}/scripts/{script_name}/secrets",
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
