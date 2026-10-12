/** @generated from zero-trust.access.infrastructure.audit-ssh-settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings`,
} as const;
