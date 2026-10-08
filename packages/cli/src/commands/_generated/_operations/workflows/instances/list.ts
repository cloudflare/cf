/** @generated from workflows.instances.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}/instances",
	query: [
		"page",
		"per_page",
		"cursor",
		"direction",
		"status",
		"date_start",
		"date_end",
	],
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
