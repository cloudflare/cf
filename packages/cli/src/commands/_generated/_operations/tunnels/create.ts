/** @generated from tunnels.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cfd_tunnel`,
	body: "json",
} as const;
