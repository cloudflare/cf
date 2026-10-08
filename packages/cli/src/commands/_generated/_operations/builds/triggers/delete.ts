/** @generated from builds.triggers.delete */
export default {
	method: "DELETE",
	path: "/accounts/{account_id}/builds/triggers/{trigger_uuid}",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
