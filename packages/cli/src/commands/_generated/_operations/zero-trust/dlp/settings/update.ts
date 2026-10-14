/** @generated from zero-trust.dlp.settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/settings`,
	body: "json",
} as const;
