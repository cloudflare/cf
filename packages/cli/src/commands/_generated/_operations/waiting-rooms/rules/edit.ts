/** @generated from waiting-rooms.rules.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/waiting_rooms/${request.waiting_room_id}/rules/${request.rule_id}`,
	body: "json",
	constants: {
		action: "bypass_waiting_room",
	},
} as const;
