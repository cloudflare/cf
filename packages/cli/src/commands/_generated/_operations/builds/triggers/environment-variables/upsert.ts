/** @generated from builds.triggers.environment-variables.upsert */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/builds/triggers/{trigger_uuid}/environment_variables",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
