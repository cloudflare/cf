/** @generated from workflows.instances.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
