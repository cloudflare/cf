/** @generated from domain-history-get-domain-history */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/domain-history`,
	query: ["domain"],
} as const;
