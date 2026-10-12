/** @generated from secondary-dns-(-tsig)-list-tsi-gs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/secondary_dns/tsigs`,
} as const;
