/** @generated from magic-static-routes-update-route */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes/${request.route_id}`,
	body: "json",
} as const;
