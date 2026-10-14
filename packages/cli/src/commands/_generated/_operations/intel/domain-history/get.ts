/** @generated from intel.domain-history.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/domain-history`,
	query: ["domain"],
} as const;
