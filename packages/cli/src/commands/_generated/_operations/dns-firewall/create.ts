/** @generated from dns-firewall-create-dns-firewall-cluster */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dns_firewall`,
	body: "json",
} as const;
