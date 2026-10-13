/** @generated from zero-trust.dlp.email.rules.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules`,
} as const;
