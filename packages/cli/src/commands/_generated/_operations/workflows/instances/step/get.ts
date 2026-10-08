/** @generated from workflows.instances.step.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}/step",
	query: ["name", "type", "attempt"],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		429: "TooManyRequestsError",
		500: "InternalServerError",
	},
} as const;
