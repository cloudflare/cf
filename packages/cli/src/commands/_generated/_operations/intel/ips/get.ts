/** @generated from intel.ips.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/ip`,
	query: ["ipv4", "ipv6"],
} as const;
