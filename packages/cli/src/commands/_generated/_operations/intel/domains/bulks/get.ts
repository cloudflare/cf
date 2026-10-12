/** @generated from domain-intelligence-get-multiple-domain-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/domain/bulk`,
	query: ["domain", "include_ranking", "skip_ranking"],
} as const;
