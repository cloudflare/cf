/** @generated from builds.triggers.cache.purge */
export default {
	method: "POST",
	path: "/accounts/{account_id}/builds/triggers/{trigger_uuid}/purge_build_cache",
	errors: {
		401: "UnauthorizedError",
		404: "NotFoundError",
	},
} as const;
