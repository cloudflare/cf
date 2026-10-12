/** @generated from zero-trust-networks-subnets-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/subnets`,
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
