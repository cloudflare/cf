/** @generated from bot-management-for-a-zone-get-config */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/bot_management`,
} as const;
