/** @generated from connectivity-services-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/connectivity/directory/services/${request.service_id}`,
} as const;
