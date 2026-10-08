/** @generated from builds.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/builds/workers/{external_script_id}/builds",
	query: ["page", "per_page"],
	errors: {
		401: "UnauthorizedError",
	},
} as const;
