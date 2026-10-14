/** @generated from zero-trust.access.infrastructure.ssh-ca.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/gateway_ca`,
} as const;
