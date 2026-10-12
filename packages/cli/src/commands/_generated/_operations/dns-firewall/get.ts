/** @generated from dns-firewall-dns-firewall-cluster-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_firewall/${request.dns_firewall_id}`,
} as const;
