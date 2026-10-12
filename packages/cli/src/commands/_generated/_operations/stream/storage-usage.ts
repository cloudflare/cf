/** @generated from stream.storage-usage */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/storage-usage`,
	query: ["creator"],
} as const;
