/** @generated from zero-trust-update-audit-ssh-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings`,
	body: "json",
} as const;
