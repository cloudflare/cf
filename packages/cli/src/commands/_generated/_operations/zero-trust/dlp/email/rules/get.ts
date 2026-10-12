/** @generated from dlp-email-scanner-get-rule */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules/${request.rule_id}`,
} as const;
