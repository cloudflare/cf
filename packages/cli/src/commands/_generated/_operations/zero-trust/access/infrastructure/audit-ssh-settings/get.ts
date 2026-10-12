/** @generated from zero-trust-get-audit-ssh-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings`,
} as const;
