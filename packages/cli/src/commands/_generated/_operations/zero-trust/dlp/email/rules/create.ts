/** @generated from dlp-email-scanner-create-rule */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules`,
	body: "json",
} as const;
