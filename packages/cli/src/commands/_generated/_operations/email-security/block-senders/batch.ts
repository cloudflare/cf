/** @generated from email-security.block-senders.batch */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/batch`,
	body: "json",
} as const;
