/** @generated from ip-intelligence-get-ip-overview */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/ip`,
	query: ["ipv4", "ipv6"],
} as const;
