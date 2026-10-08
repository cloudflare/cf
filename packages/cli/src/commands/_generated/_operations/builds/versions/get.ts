/** @generated from builds.versions.get */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/builds",
	query: ["version_ids"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
