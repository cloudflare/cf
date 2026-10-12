/** @generated from dns.zone-transfers.acls.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/acls/${request.acl_id}`,
} as const;
