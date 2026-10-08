/** @generated from builds.triggers.environment-variables.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/triggers/{trigger_uuid}/environment_variables/{environment_variable_key}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
