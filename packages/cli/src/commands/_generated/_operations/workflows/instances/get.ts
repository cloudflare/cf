/** @generated from workflows.instances.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}",
	query: ["simple", "order"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
