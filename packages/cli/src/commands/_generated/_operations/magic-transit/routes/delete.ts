/** @generated from magic-static-routes-delete-route */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes/${request.route_id}`,
} as const;
