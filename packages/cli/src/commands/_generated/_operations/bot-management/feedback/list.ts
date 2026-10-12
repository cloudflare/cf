/** @generated from bot-management-zone-feedback-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/bot_management/feedback`,
} as const;
