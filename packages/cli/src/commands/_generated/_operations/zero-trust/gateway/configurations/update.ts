/** @generated from zero-trust.gateway.configurations.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration`,
	body: "json",
} as const;
