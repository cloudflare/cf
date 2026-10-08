/** @generated from network.subnets.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/zerotrust/subnets",
	query: [
		"name",
		"comment",
		"network",
		"existed_at",
		"address_family",
		"is_default_network",
		"is_deleted",
		"sort_order",
		"subnet_types",
		"per_page",
		"page",
	],
} as const;
