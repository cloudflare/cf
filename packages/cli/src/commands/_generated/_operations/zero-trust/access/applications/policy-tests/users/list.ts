/** @generated from zero-trust.access.applications.policy-tests.users.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/access/policy-tests/{policy_test_id}/users",
	query: ["page", "per_page", "status"],
	errors: {
		400: "BadRequestError",
	},
} as const;
