/** @generated from ip-address-management-service-bindings-list-services */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/services`,
} as const;
