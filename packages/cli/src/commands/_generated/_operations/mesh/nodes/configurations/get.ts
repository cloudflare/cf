/** @generated from mesh.nodes.configurations.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/configurations`,
} as const;
