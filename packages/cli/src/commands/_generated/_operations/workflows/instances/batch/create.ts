/** @generated from workflows.instances.batch.create */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances/batch",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
