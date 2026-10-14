/** @generated from user.memberships.list */
export default {
	method: "GET",
	path: () => "/memberships",
	query: [
		"account.name",
		"page",
		"per_page",
		"order",
		"direction",
		"name",
		"status",
	],
} as const;
