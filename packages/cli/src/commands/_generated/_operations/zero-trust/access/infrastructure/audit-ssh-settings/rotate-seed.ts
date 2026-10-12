/** @generated from zero-trust-rotate-ssh-account-seed */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/audit_ssh_settings/rotate_seed`,
} as const;
