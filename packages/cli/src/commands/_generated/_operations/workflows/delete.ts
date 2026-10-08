/** @generated from workflows.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/workflows/{workflow_name}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
