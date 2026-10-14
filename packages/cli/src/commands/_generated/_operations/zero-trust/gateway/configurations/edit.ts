/** @generated from zero-trust.gateway.configurations.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration`,
	body: "json",
} as const;
