/** @generated from zero-trust-dns-destination-ips-list-dns-destination-ips */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/dns_destination_ips`,
} as const;
