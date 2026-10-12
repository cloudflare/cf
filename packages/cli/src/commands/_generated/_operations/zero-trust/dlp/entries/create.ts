/** @generated from dlp-entries-create-entry */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries`,
	body: "json",
} as const;
