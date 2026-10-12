/** @generated from tunnel-route-update-a-tunnel-route */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes/${request.route_id}`,
	body: "json",
} as const;
