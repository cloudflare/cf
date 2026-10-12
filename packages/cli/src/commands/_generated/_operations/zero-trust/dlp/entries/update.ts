/** @generated from zero-trust.dlp.entries.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries/${request.entry_id}`,
	body: "json",
} as const;
