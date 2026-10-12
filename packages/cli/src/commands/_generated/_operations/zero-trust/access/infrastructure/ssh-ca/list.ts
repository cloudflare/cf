/** @generated from zero-trust.access.infrastructure.ssh-ca.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/gateway_ca`,
} as const;
