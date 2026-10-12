/** @generated from dlp-email-scanner-get-account-mapping */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/account_mapping`,
} as const;
