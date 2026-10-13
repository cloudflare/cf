/** @generated from dns.zone-transfers.tsigs.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs/${request.tsig_id}`,
} as const;
