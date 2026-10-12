/** @generated from connectivity-services-put */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/connectivity/directory/services/${request.service_id}`,
	body: "json",
} as const;
