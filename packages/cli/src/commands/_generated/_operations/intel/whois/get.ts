/** @generated from intel.whois.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/whois`,
	query: ["domain"],
} as const;
