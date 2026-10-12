/** @generated from intel.dns.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/dns`,
	query: ["start_end_params", "ipv4", "page", "per_page"],
} as const;
