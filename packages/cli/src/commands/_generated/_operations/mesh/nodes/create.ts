/** @generated from cloudflare-tunnel-create-a-warp-connector-tunnel */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector`,
	body: "json",
} as const;
