/** @generated from dns-firewall-delete-dns-firewall-cluster */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_firewall/${request.dns_firewall_id}`,
} as const;
