/** @generated from dlp-email-scanner-update-rule */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules/${request.rule_id}`,
	body: "json",
} as const;
