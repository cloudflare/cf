/** @generated from dlp-entries-list-all-entries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries`,
} as const;
