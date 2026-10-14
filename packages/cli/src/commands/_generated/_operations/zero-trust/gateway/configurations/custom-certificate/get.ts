/** @generated from zero-trust.gateway.configurations.custom-certificate.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/configuration/custom_certificate`,
} as const;
