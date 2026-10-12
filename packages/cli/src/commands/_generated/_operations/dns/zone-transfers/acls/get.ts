/** @generated from dns.zone-transfers.acls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls/${request.acl_id}`,
} as const;
