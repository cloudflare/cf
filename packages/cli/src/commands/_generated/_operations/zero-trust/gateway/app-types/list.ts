/** @generated from zero-trust.gateway.app-types.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/gateway/app_types`,
} as const;
