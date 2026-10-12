/** @generated from dlp-entries-delete-entry */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries/${request.entry_id}`,
} as const;
