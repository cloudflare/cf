/** @generated from zero-trust.dlp.email.account-mapping.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/account_mapping`,
	body: "json",
} as const;
