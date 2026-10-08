/** @generated from workflows.versions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/workflows/{workflow_name}/versions/{version_id}",
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
	},
} as const;
