/** @generated from dns-firewall-update-dns-firewall-cluster-reverse-dns */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_firewall/${request.dns_firewall_id}/reverse_dns`,
	body: "json",
} as const;
