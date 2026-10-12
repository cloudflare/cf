/** @generated from zero-trust-networks-route-hostname-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/routes/hostname/${request.hostname_route_id}`,
} as const;
