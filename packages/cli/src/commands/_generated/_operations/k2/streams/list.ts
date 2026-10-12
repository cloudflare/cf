/** @generated from getV4AccountsByAccount_idK2Streams */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams`,
	query: ["name", "page", "per_page"],
} as const;
