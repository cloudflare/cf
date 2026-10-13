/** @generated from intel.urls.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/url`,
	query: ["url"],
} as const;
