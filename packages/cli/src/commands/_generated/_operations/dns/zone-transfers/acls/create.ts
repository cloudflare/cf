/** @generated from dns.zone-transfers.acls.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls`,
	body: "json",
} as const;
