/** @generated from zero-trust-gateway-application-and-application-type-mappings-list-application-and-application-type-mappings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/app_types`,
} as const;
