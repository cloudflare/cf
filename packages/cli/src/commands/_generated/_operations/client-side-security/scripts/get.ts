/** @generated from client-side-security.scripts.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/page_shield/scripts/${request.script_id}`,
} as const;
