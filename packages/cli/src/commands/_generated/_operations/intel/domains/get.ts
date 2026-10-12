/** @generated from domain-intelligence-get-domain-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/domain`,
	query: ["domain", "skip_dns", "skip_ranking"],
} as const;
