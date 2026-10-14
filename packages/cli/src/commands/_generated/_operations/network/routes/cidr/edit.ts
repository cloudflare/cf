/** @generated from network.routes.cidr.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes/${request.route_id}`,
	body: "json",
} as const;
