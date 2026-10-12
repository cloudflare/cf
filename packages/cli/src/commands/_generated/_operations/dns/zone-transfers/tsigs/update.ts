/** @generated from dns.zone-transfers.tsigs.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs/${request.tsig_id}`,
	body: "json",
} as const;
