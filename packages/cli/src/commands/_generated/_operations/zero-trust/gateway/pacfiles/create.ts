/** @generated from zero-trust-gateway-pacfiles-create-pacfile */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/pacfiles`,
	body: "json",
} as const;
