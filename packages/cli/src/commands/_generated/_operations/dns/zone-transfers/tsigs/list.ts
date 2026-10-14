/** @generated from dns.zone-transfers.tsigs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs`,
} as const;
