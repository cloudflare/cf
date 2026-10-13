/** @generated from bot-management.feedback.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/bot_management/feedback`,
	body: "json",
	response: false,
} as const;
