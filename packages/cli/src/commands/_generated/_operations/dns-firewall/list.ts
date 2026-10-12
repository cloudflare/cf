/** @generated from dns-firewall-list-dns-firewall-clusters */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_firewall`,
	query: ["page", "per_page"],
} as const;
