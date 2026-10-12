/** @generated from secondary-dns-(-tsig)-delete-tsig */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs/${request.tsig_id}`,
} as const;
