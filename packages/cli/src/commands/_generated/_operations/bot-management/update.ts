/** @generated from bot-management-for-a-zone-update-config */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/bot_management`,
	body: "json",
} as const;
