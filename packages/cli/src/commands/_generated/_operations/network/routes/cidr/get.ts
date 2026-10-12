/** @generated from tunnel-route-get-tunnel-route */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/teamnet/routes/${request.route_id}`,
} as const;
