/** @generated from zero-trust.gateway.dns-destination-ips.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/dns_destination_ips`,
} as const;
