/** @generated from workflows.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
