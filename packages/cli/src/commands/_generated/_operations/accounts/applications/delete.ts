/** @generated from accounts.applications.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/resource-library/applications/{id}",
	errors: {
		409: "ConflictError",
		502: "BadGatewayError",
	},
} as const;
