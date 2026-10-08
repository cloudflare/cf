/** @generated from accounts.logs.audit.history */
export default {
	method: "GET",
	path: "/accounts/{account_id}/logs/audit/{id}/history",
	query: ["action_time", "since", "before", "direction", "limit", "cursor"],
	errors: {
		404: "NotFoundError",
	},
} as const;
