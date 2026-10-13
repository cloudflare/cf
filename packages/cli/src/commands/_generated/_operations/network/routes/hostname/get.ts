/** @generated from network.routes.hostname.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/routes/hostname/${request.hostname_route_id}`,
} as const;
