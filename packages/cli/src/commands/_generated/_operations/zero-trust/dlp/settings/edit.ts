/** @generated from dlp-settings-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/settings`,
	body: "json",
} as const;
