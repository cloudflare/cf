/** @generated from workers-vpc.services.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/connectivity/directory/services/${request.service_id}`,
	response: false,
} as const;
