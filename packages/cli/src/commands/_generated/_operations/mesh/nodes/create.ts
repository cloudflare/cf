/** @generated from mesh.nodes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/warp_connector`,
	body: "json",
} as const;
