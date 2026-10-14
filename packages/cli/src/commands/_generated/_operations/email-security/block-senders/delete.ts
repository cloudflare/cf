/** @generated from email-security.block-senders.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/settings/block_senders/${request.pattern_id}`,
} as const;
