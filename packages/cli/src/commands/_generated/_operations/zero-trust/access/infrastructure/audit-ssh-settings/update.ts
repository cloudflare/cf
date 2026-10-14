/** @generated from zero-trust.access.infrastructure.audit-ssh-settings.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings`,
	body: "json",
} as const;
