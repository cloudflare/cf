/** @generated from zero-trust.access.infrastructure.audit-ssh-settings.rotate-seed */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings/rotate_seed`,
} as const;
