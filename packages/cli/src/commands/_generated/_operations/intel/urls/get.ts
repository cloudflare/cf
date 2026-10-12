/** @generated from url-intelligence-get-url-intelligence */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/url`,
	query: ["url"],
} as const;
