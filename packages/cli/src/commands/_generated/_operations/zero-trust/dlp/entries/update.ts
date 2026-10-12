/** @generated from dlp-entries-update-entry */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries/${request.entry_id}`,
	body: "json",
} as const;
