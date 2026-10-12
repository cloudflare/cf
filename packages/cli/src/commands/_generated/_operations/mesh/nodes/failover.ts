/** @generated from mesh.nodes.failover */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector/${request.tunnel_id}/failover`,
	body: "json",
} as const;
