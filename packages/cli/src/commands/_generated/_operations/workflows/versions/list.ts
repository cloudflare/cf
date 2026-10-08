/** @generated from workflows.versions.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}/versions",
	query: ["per_page", "page"],
	errors: {
		400: "BadRequestError",
	},
} as const;
