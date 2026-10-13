/** @generated from zero-trust.dlp.entries.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/entries`,
	body: "json",
} as const;
