/** @generated from workflows.instances.pause */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}/status",
	body: "json",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
