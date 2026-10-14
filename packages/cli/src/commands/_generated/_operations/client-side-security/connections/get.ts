/** @generated from client-side-security.connections.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/connections/${request.connection_id}`,
} as const;
