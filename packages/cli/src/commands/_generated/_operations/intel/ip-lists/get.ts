/** @generated from ip-list-get-ip-lists */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/ip-lists`,
} as const;
