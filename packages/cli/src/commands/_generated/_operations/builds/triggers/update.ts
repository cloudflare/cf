/** @generated from builds.triggers.update */
export default {
	method: "PATCH",
	path: "/accounts/{account_id}/builds/triggers/{trigger_uuid}",
	body: "json",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
