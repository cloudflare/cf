/** @generated from cloudflare-tunnel-configuration-update-warp-connector-configuration */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/configurations`,
	body: "json",
} as const;
