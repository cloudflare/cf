/** @generated from network.routes.cidr.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes/${request.route_id}`,
} as const;
