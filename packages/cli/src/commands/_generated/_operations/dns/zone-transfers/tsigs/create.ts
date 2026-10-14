/** @generated from dns.zone-transfers.tsigs.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs`,
	body: "json",
} as const;
