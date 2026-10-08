/** @generated from workflows.instances.events.send */
export default {
	method: "POST",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances/{instance_id}/events/{event_type}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
