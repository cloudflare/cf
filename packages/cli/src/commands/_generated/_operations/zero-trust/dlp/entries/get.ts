/** @generated from dlp-entries-get-dlp-entry */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries/${request.entry_id}`,
} as const;
