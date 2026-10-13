/** @generated from magic-transit.routes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes/${request.route_id}`,
} as const;
