/** @generated from infra-targets-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/infrastructure/targets`,
	query: [
		"hostname",
		"hostname_contains",
		"virtual_network_id",
		"ip_v4",
		"ip_v6",
		"created_before",
		"created_after",
		"modified_before",
		"modified_after",
		"ips",
		"target_ids",
		"ip_like",
		"ipv4_start",
		"ipv4_end",
		"ipv6_start",
		"ipv6_end",
		"tag",
		"page",
		"per_page",
		"order",
		"direction",
	],
} as const;
