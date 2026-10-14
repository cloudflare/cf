/** @generated from bot-management.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/bot_management`,
	body: "json",
} as const;
